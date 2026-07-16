from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.core import mail
from unittest.mock import patch, MagicMock
import threading

from products.models import Category, Product
from orders.models import Order, OrderItem, PendingPayment
from rest_framework_simplejwt.tokens import RefreshToken


class OrderEmailTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Patch Thread.start to run synchronously in tests
        self.original_start = threading.Thread.start
        threading.Thread.start = lambda t: t.run()

        # Create user
        self.user = User.objects.create_user(
            username="buyer@example.com",
            email="buyer@example.com",
            password="buyerpassword123",
            first_name="Buyer"
        )
        
        # Authenticate user with JWT
        refresh = RefreshToken.for_user(self.user)
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {refresh.access_token}'

        # Create category and product
        self.category = Category.objects.create(name="Tennis", slug="tennis")
        self.product = Product.objects.create(
            name="Pro Racket",
            price=2999.00,
            category=self.category,
            stock=10
        )

    def tearDown(self):
        threading.Thread.start = self.original_start

    def test_cod_checkout_sends_confirmation_email(self):
        mail.outbox = []

        data = {
            "fullName": "Buyer Kumar",
            "phone": "9876543210",
            "line1": "123 Green Avenue",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600001",
            "buy_now_product_id": self.product.id,
            "buy_now_qty": 2,
            "buy_now_size": "M",
            "discount": 0
        }

        response = self.client.post(
            "/api/orders/checkout/",
            data=data,
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Check order was created in DB
        order = Order.objects.filter(user=self.user, payment_method="COD").first()
        self.assertIsNotNone(order)
        self.assertEqual(order.total_price, 5998.00)

        # Verify confirmation email was sent
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.subject, f"Your SportZone Order #{order.id} Has Been Confirmed ✅")
        self.assertEqual(email.to, ["buyer@example.com"])
        self.assertIn("Buyer Kumar", email.body)
        self.assertIn("#" + str(order.id), email.body)
        self.assertIn("Pro Racket", email.body)

        # Verify HTML content
        html_content = email.alternatives[0][0]
        self.assertIn("Order Confirmed", html_content)
        self.assertIn("₹5998.00", html_content)
        self.assertIn("123 Green Avenue", html_content)

    @patch("razorpay.Client")
    def test_razorpay_payment_verification_sends_confirmation_email(self, mock_razorpay_client):
        mail.outbox = []

        # Setup mock for Razorpay client and utility verify signature
        mock_client_instance = MagicMock()
        mock_razorpay_client.return_value = mock_client_instance
        mock_client_instance.utility.verify_payment_signature.return_value = True

        # Pre-create a PendingPayment in local DB
        PendingPayment.objects.create(
            user=self.user,
            razorpay_order_id="rzp_order_test123",
            checkout_data={
                "fullName": "Buyer Kumar",
                "phone": "9876543210",
                "line1": "123 Green Avenue",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "pincode": "600001",
                "discount": 0.0,
                "total_price": 2999.00,
                "is_buy_now": True,
                "buy_now_product_id": self.product.id,
                "buy_now_qty": 1,
                "buy_now_size": "M"
            }
        )

        data = {
            "razorpay_order_id": "rzp_order_test123",
            "razorpay_payment_id": "pay_test123",
            "razorpay_signature": "sig_test123"
        }

        response = self.client.post(
            "/api/orders/verify_payment/",
            data=data,
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        # Retrieve order from DB
        order = Order.objects.filter(razorpay_order_id="rzp_order_test123").first()
        self.assertIsNotNone(order)
        self.assertEqual(order.payment_status, "Paid")
        self.assertEqual(order.razorpay_payment_id, "pay_test123")
        self.assertEqual(order.razorpay_signature, "sig_test123")
        
        # Verify that PendingPayment is deleted
        self.assertFalse(PendingPayment.objects.filter(razorpay_order_id="rzp_order_test123").exists())

        # Verify confirmation email was sent
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.subject, f"Your SportZone Order #{order.id} Has Been Confirmed ✅")
        self.assertEqual(email.to, ["buyer@example.com"])
        self.assertIn("Buyer Kumar", email.body)

    def test_order_delivered_status_change_sends_email(self):
        mail.outbox = []

        # Pre-create a normal order
        order = Order.objects.create(
            user=self.user,
            total_price=2999.00,
            status="Pending",
            shipping_name="Buyer Kumar",
            shipping_phone="9876543210",
            shipping_address="123 Green Avenue",
            shipping_city="Chennai",
            shipping_state="Tamil Nadu",
            shipping_pincode="600001",
            payment_method="COD",
            payment_status="Pending"
        )
        
        # Change status to Shipped (should NOT send delivered email)
        order.status = "Shipped"
        order.save()
        self.assertEqual(len(mail.outbox), 0)

        # Change status to Delivered (should send delivered email)
        order.status = "Delivered"
        order.save()
        
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.subject, f"Your SportZone Order #{order.id} Has Been Delivered 📦")
        self.assertEqual(email.to, ["buyer@example.com"])
        self.assertIn("delivered", email.body.lower())
        self.assertIn("Buyer Kumar", email.body)

        # Verify HTML content
        html_content = email.alternatives[0][0]
        self.assertIn("Order Delivered", html_content)
        self.assertIn("₹2999.00", html_content)
