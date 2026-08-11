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
        self.assertTrue(email.subject.startswith(f"Your SportZone Order #{order.id} Has Been Delivered"))
        self.assertEqual(email.to, ["buyer@example.com"])
        self.assertIn("delivered", email.body.lower())
        self.assertIn("Buyer Kumar", email.body)

        # Verify HTML content
        html_content = email.alternatives[0][0]
        self.assertIn("Order Delivered", html_content)
        self.assertIn("₹2999.00", html_content)


class StockManagementTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.original_start = threading.Thread.start
        threading.Thread.start = lambda t: t.run()

        self.user = User.objects.create_user(
            username="stockbuyer@example.com",
            email="stockbuyer@example.com",
            password="password123",
            first_name="StockBuyer"
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {refresh.access_token}'

        self.category = Category.objects.create(name="Cricket", slug="cricket")
        self.product = Product.objects.create(
            name="English Willow Bat",
            price=5000.00,
            category=self.category,
            stock=5
        )
        from products.models import ProductSize
        self.size_m = ProductSize.objects.create(
            product=self.product,
            size="M",
            stock=3
        )

    def tearDown(self):
        threading.Thread.start = self.original_start

    def test_cod_checkout_decrements_product_size_stock(self):
        data = {
            "fullName": "Stock Buyer",
            "phone": "9876543210",
            "line1": "456 Park Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "buy_now_product_id": self.product.id,
            "buy_now_qty": 2,
            "buy_now_size": "M",
            "discount": 0
        }

        response = self.client.post("/api/orders/checkout/", data=data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        # Refresh size stock from DB
        self.size_m.refresh_from_db()
        self.assertEqual(self.size_m.stock, 1)

    def test_cod_checkout_rejects_insufficient_stock(self):
        data = {
            "fullName": "Stock Buyer",
            "phone": "9876543210",
            "line1": "456 Park Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "buy_now_product_id": self.product.id,
            "buy_now_qty": 10,
            "buy_now_size": "M",
            "discount": 0
        }

        response = self.client.post("/api/orders/checkout/", data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        self.assertIn("Only 3 items are available", response.json()["error"])

        # Ensure stock remained unchanged
        self.size_m.refresh_from_db()
        self.assertEqual(self.size_m.stock, 3)

    def test_cod_checkout_decrements_product_global_stock(self):
        data = {
            "fullName": "Stock Buyer",
            "phone": "9876543210",
            "line1": "456 Park Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "buy_now_product_id": self.product.id,
            "buy_now_qty": 3,
            "buy_now_size": "N/A",
            "discount": 0
        }

        response = self.client.post("/api/orders/checkout/", data=data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

    def test_cancellation_restores_stock(self):
        # Create an order
        data = {
            "fullName": "Stock Buyer",
            "phone": "9876543210",
            "line1": "456 Park Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "buy_now_product_id": self.product.id,
            "buy_now_qty": 2,
            "buy_now_size": "M",
            "discount": 0
        }

        res = self.client.post("/api/orders/checkout/", data=data, content_type="application/json")
        order_id = res.json()["order_id"]

        self.size_m.refresh_from_db()
        self.assertEqual(self.size_m.stock, 1)

        # Cancel the order
        cancel_res = self.client.post(f"/api/orders/{order_id}/cancel/")
        self.assertEqual(cancel_res.status_code, 200)

        self.size_m.refresh_from_db()
        self.assertEqual(self.size_m.stock, 3)

        # Cancel again should be idempotent (no double restore)
        cancel_res2 = self.client.post(f"/api/orders/{order_id}/cancel/")
        self.assertEqual(cancel_res2.status_code, 400)

        self.size_m.refresh_from_db()
        self.assertEqual(self.size_m.stock, 3)


class SecurityDiscountTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.original_start = threading.Thread.start
        threading.Thread.start = lambda t: t.run()

        self.user = User.objects.create_user(
            username="secbuyer@example.com",
            email="secbuyer@example.com",
            password="password123",
            first_name="SecBuyer"
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {refresh.access_token}'

        self.category = Category.objects.create(name="Football", slug="football")
        self.product = Product.objects.create(
            name="Match Football",
            price=2000.00,
            category=self.category,
            stock=10
        )

    def tearDown(self):
        threading.Thread.start = self.original_start

    def test_checkout_ignores_huge_client_discount(self):
        data = {
            "fullName": "Security Test User",
            "phone": "9876543210",
            "line1": "789 Security St",
            "city": "Bangalore",
            "state": "Karnataka",
            "pincode": "560001",
            "buy_now_product_id": self.product.id,
            "buy_now_qty": 2,
            "buy_now_size": "N/A",
            "discount": 999999  # Malicious huge discount attempt
        }

        response = self.client.post("/api/orders/checkout/", data=data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        order_id = response.json()["order_id"]
        order = Order.objects.get(id=order_id)
        # Total price must be exactly ₹4000.00 (2000 * 2), ignoring the 999999 discount
        self.assertEqual(order.total_price, 4000.00)

    def test_checkout_ignores_negative_client_discount(self):
        data = {
            "fullName": "Security Test User",
            "phone": "9876543210",
            "line1": "789 Security St",
            "city": "Bangalore",
            "state": "Karnataka",
            "pincode": "560001",
            "buy_now_product_id": self.product.id,
            "buy_now_qty": 1,
            "buy_now_size": "N/A",
            "discount": -500  # Malicious negative discount attempt
        }

        response = self.client.post("/api/orders/checkout/", data=data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        order_id = response.json()["order_id"]
        order = Order.objects.get(id=order_id)
        self.assertEqual(order.total_price, 2000.00)

    @patch("razorpay.Client")
    def test_create_razorpay_order_ignores_client_discount(self, mock_razorpay_client):
        mock_client_instance = MagicMock()
        mock_razorpay_client.return_value = mock_client_instance
        mock_client_instance.order.create.return_value = {"id": "rzp_order_sec123"}

        data = {
            "fullName": "Security Test User",
            "phone": "9876543210",
            "line1": "789 Security St",
            "city": "Bangalore",
            "state": "Karnataka",
            "pincode": "560001",
            "buy_now_product_id": self.product.id,
            "buy_now_qty": 3,
            "buy_now_size": "N/A",
            "discount": 5000  # Attempt to reduce ₹6000 total
        }

        response = self.client.post("/api/orders/create_razorpay_order/", data=data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        # 3 * 2000 = 6000 INR = 600000 paise
        self.assertEqual(response.json()["amount"], 600000)

        pending = PendingPayment.objects.get(razorpay_order_id="rzp_order_sec123")
        self.assertEqual(pending.checkout_data["total_price"], 6000.00)
