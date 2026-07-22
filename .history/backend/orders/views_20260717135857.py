from rest_framework import mixins, viewsets, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from users.permissions import IsNotBlocked
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.shortcuts import get_object_or_404
from django.conf import settings
import razorpay

from django.db import transaction
from .models import Cart, Order, OrderItem, Wishlist, PendingPayment
from .serializers import (
    AdminOrderSerializer,
    AdminOrderStatusSerializer,
    CartSerializer,
    OrderSerializer,
    WishlistProductSerializer,
)

from products.models import Product
from users.models import UserProfile


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


# 🔥 CART VIEWSET
class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated, IsNotBlocked]
    # 🔥 Only logged-in user's cart
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user).select_related(
            "product",
            "product__category",
        )

    # 🔥 Save user automatically
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        # Ensure nested ProductSerializer can build absolute image URLs.
        return {"request": self.request}


# 🔥 ORDER VIEWSET
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsNotBlocked]

    # 🔥 Only user's orders
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    # 🔥 IMPORTANT (for full image URL)
    def get_serializer_context(self):
        return {"request": self.request}

    # 🔥 CHECKOUT API (COD)
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        user = request.user
        profile = UserProfile.objects.filter(user=user).first()
        if profile and profile.is_blocked:
            return Response({"error": "Your account has been suspended."}, status=403)

        buy_now_product_id = request.data.get("buy_now_product_id")
        buy_now_size = request.data.get("buy_now_size", "N/A")
        buy_now_qty = request.data.get("buy_now_qty")
        discount = request.data.get("discount", 0)
        try:
            discount = float(discount)
        except (ValueError, TypeError):
            discount = 0.0

        # Extract address details from request data
        fullName = request.data.get("fullName")
        phone = request.data.get("phone")
        line1 = request.data.get("line1")
        city = request.data.get("city")
        state = request.data.get("state")
        pincode = request.data.get("pincode")

        # Validate minimum fields for shipping address
        if not all([fullName, phone, line1, city, pincode]):
            return Response({"error": "Please provide all required shipping details."}, status=400)

        if buy_now_product_id:
            try:
                Product.objects.get(
    id=buy_now_product_id,
    category__is_active=True,
)
            except Product.DoesNotExist:
                return Response({"error": "Product not found"}, status=404)
            qty = int(buy_now_qty or 1)
            total = max(0.0, float(product.price * qty) - discount)

            # Create local Order for COD
            order = Order.objects.create(
                user=user,
                total_price=total,
                status="Pending",
                shipping_name=fullName,
                shipping_phone=phone,
                shipping_address=line1,
                shipping_city=city,
                shipping_state=state,
                shipping_pincode=pincode,
                payment_method="COD",
                payment_status="Pending"
            )

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=qty,
                price=product.price,
                unit_price=product.price,
                selected_size=buy_now_size,
            )
        else:
            cart_items = Cart.objects.filter(user=user)
            if not cart_items.exists():
                return Response({"error": "Cart is empty"}, status=400)

            # Calculate order total
            total = sum(item.product.price * item.quantity for item in cart_items)
            total = max(0.0, float(total) - discount)

            # Create local Order for COD
            order = Order.objects.create(
                user=user,
                total_price=total,
                status="Pending",
                shipping_name=fullName,
                shipping_phone=phone,
                shipping_address=line1,
                shipping_city=city,
                shipping_state=state,
                shipping_pincode=pincode,
                payment_method="COD",
                payment_status="Pending"
            )

            # Create Order Items corresponding to cart contents
            for item in cart_items:
               OrderItem.objects.create(
                 order=order,
                 product=item.product,
                 product_name=item.product.name,
                 quantity=item.quantity,
                 price=item.product.price,
                 unit_price=item.product.price,
                 selected_size=item.size,
               )

            # Clear the user's cart upon successful COD order creation
            cart_items.delete()

        # ✅ SEND ORDER CONFIRMATION EMAIL ASYNCHRONOUSLY
        from sportzone.email_utils import send_order_confirmation_email_async
        send_order_confirmation_email_async(order)

        return Response({"message": "Order placed successfully", "order_id": order.id})

    # 🔥 CREATE RAZORPAY ORDER API
    @action(detail=False, methods=['post'])
    def create_razorpay_order(self, request):
        user = request.user
        profile = UserProfile.objects.filter(user=user).first()
        if profile and profile.is_blocked:
            return Response({"error": "Your account has been suspended."}, status=403)

        buy_now_product_id = request.data.get("buy_now_product_id")
        buy_now_size = request.data.get("buy_now_size", "N/A")
        buy_now_qty = request.data.get("buy_now_qty")
        discount = request.data.get("discount", 0)
        try:
            discount = float(discount)
        except (ValueError, TypeError):
            discount = 0.0

        # Extract address details from request data
        fullName = request.data.get("fullName")
        phone = request.data.get("phone")
        line1 = request.data.get("line1")
        city = request.data.get("city")
        state = request.data.get("state")
        pincode = request.data.get("pincode")

        if not all([fullName, phone, line1, city, pincode]):
            return Response({"error": "Please provide all required shipping details."}, status=400)

        is_buy_now = bool(buy_now_product_id)

        if is_buy_now:
            try:
                product = Product.objects.get(id=buy_now_product_id)
            except Product.DoesNotExist:
                return Response({"error": "Product not found"}, status=404)
            qty = int(buy_now_qty or 1)
            total = max(0.0, float(product.price * qty) - discount)
            amount_paise = int(total * 100)

            if amount_paise < 100:
                return Response({"error": "Minimum order amount of ₹1 is required for online payments."}, status=400)

            checkout_data = {
                "fullName": fullName,
                "phone": phone,
                "line1": line1,
                "city": city,
                "state": state,
                "pincode": pincode,
                "discount": discount,
                "total_price": total,
                "is_buy_now": True,
                "buy_now_product_id": buy_now_product_id,
                "buy_now_qty": qty,
                "buy_now_size": buy_now_size,
            }
        else:
            cart_items = Cart.objects.filter(user=user)
            if not cart_items.exists():
                return Response({"error": "Cart is empty"}, status=400)

            # Calculate total price
            total = sum(item.product.price * item.quantity for item in cart_items)
            total = max(0.0, float(total) - discount)
            amount_paise = int(total * 100) # Razorpay accepts amount in paise (1 INR = 100 paise)

            if amount_paise < 100:
                return Response({"error": "Minimum order amount of ₹1 is required for online payments."}, status=400)

            checkout_data = {
                "fullName": fullName,
                "phone": phone,
                "line1": line1,
                "city": city,
                "state": state,
                "pincode": pincode,
                "discount": discount,
                "total_price": total,
                "is_buy_now": False,
                "cart_items": [
                    {
                        "product_id": item.product.id,
                        "product_name": item.product.name,
                        "quantity": item.quantity,
                        "price": float(item.product.price),
                        "unit_price": float(item.product.price),
                        "selected_size": item.size,
                    }
                    for item in cart_items
                ]
            }

        # Initiate Razorpay Order via SDK
        try:
            import logging
            import traceback
            import uuid
            logger = logging.getLogger(__name__)
            
            key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
            key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
            
            # Temporary Debug Logging
            logger.info("=== Razorpay Order Creation Debug ===")
            logger.info(f"Loaded Key ID: {key_id}")
            secret_exists = bool(key_secret)
            secret_len = len(key_secret) if key_secret else 0
            logger.info(f"Whether Secret exists: {secret_exists} (Length: {secret_len})")
            if secret_exists and secret_len >= 8:
                logger.info(f"Secret Preview: {key_secret[:4]}...{key_secret[-4:]}")
            logger.info("======================================")

            # Check if credentials exist and are valid format
            if not key_id or not key_secret:
                logger.error("[RAZORPAY ERROR] Missing Razorpay credentials in settings.")
                return Response({"error": "Razorpay credentials are not configured or are invalid (missing ID or Secret)."}, status=400)
            
            if not (key_id.startswith("rzp_test_") or key_id.startswith("rzp_live_")):
                logger.error(f"[RAZORPAY ERROR] Invalid RAZORPAY_KEY_ID format: '{key_id}'")
                return Response({"error": "Razorpay KEY_ID must start with 'rzp_test_' or 'rzp_live_'."}, status=400)

            logger.info("Initializing Razorpay client...")
            client = razorpay.Client(auth=(key_id, key_secret))
            logger.info("Razorpay client initialized successfully.")
            
            # Generate a unique receipt identifier
            receipt_id = f"rcpt_{user.id}_{uuid.uuid4().hex[:12]}"
            razorpay_order_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt_id,
                "payment_capture": 1 # Automatic capture
            }
            
            # Request Razorpay API to generate the order
            logger.info(f"Requesting Razorpay order creation with data: {razorpay_order_data}")
            razorpay_order = client.order.create(data=razorpay_order_data)
            logger.info(f"Razorpay order created successfully. Order ID: {razorpay_order.get('id')}")
            
            # Save checkout data temporarily in PendingPayment
            PendingPayment.objects.create(
                user=user,
                razorpay_order_id=razorpay_order["id"],
                checkout_data=checkout_data
            )

            return Response({
                "razorpay_order_id": razorpay_order["id"],
                "amount": amount_paise,
                "currency": "INR",
                "key_id": key_id,
                "order_id": None
            })
        except razorpay.errors.BadRequestError as e:
            logger.error("=== Razorpay BadRequestError (create_razorpay_order) ===")
            logger.error(f"Error Message: {str(e)}")
            logger.error(traceback.format_exc())
            err_msg = str(e)
            if "Authentication failed" in err_msg or "auth" in err_msg.lower():
                return Response(
                    {"error": "Razorpay authentication failed. Please check if your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct and valid."},
                    status=401
                )
            return Response(
                {"error": f"Invalid request to Razorpay: {err_msg}"},
                status=400
            )
        except Exception as e:
            logger.error("=== Razorpay SDK Unexpected Error (create_razorpay_order) ===")
            logger.error(f"Error Type: {type(e).__name__}")
            logger.error(f"Error Message: {str(e)}")
            logger.error(traceback.format_exc())
            logger.error("==================================================")
            return Response(
                {"error": f"Failed to communicate with payment gateway. Please try again. Error: {str(e)}"},
                status=500
            )

    # 🔥 VERIFY RAZORPAY PAYMENT API
    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({"error": "Payment verification details are missing."}, status=400)

        # Retrieve the pending payment session
        try:
            pending_payment = PendingPayment.objects.get(razorpay_order_id=razorpay_order_id)
        except PendingPayment.DoesNotExist:
            # Check if order was already created (e.g. from an idempotent retry or webhook)
            try:
                order = Order.objects.get(razorpay_order_id=razorpay_order_id)
                return Response({
                    "message": "Payment verified and order placed successfully.",
                    "order_id": order.id
                })
            except Order.DoesNotExist:
                return Response({"error": "Corresponding checkout session was not found in the system."}, status=404)

        # Verify payment signature securely
        try:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            
            key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
            key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
            
            # Temporary Debug Logging
            logger.info("=== Razorpay Payment Verification Debug ===")
            logger.info(f"Loaded Key ID: {key_id}")
            secret_exists = bool(key_secret)
            secret_len = len(key_secret) if key_secret else 0
            logger.info(f"Whether Secret exists: {secret_exists} (Length: {secret_len})")
            if secret_exists and secret_len >= 8:
                logger.info(f"Secret Preview: {key_secret[:4]}...{key_secret[-4:]}")
            logger.info("==========================================")

            # Check if credentials exist and are valid format
            if not key_id or not key_secret:
                logger.error("[RAZORPAY ERROR] Missing Razorpay credentials in settings.")
                return Response({"error": "Razorpay credentials are not configured or are invalid (missing ID or Secret)."}, status=400)
            
            if not (key_id.startswith("rzp_test_") or key_id.startswith("rzp_live_")):
                logger.error(f"[RAZORPAY ERROR] Invalid RAZORPAY_KEY_ID format: '{key_id}'")
                return Response({"error": "Razorpay KEY_ID must start with 'rzp_test_' or 'rzp_live_'."}, status=400)

            logger.info("Initializing Razorpay client for verification...")
            client = razorpay.Client(auth=(key_id, key_secret))
            logger.info("Razorpay client initialized successfully.")
            
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            # signature verification method
            logger.info(f"Verifying payment signature with params: {params_dict}")
            client.utility.verify_payment_signature(params_dict)
            logger.info("Payment signature verified successfully.")

            # Create order from stored checkout data and clean up cart/pending payment atomically
            checkout_data = pending_payment.checkout_data
            is_buy_now = checkout_data.get("is_buy_now", False)
            total = checkout_data.get("total_price")

            with transaction.atomic():
                order = Order.objects.create(
                    user=pending_payment.user,
                    total_price=total,
                    status="Pending",
                    shipping_name=checkout_data.get("fullName"),
                    shipping_phone=checkout_data.get("phone"),
                    shipping_address=checkout_data.get("line1"),
                    shipping_city=checkout_data.get("city"),
                    shipping_state=checkout_data.get("state"),
                    shipping_pincode=checkout_data.get("pincode"),
                    payment_method="Razorpay",
                    payment_status="Paid",
                    razorpay_order_id=razorpay_order_id,
                    razorpay_payment_id=razorpay_payment_id,
                    razorpay_signature=razorpay_signature,
                )

                if is_buy_now:
                    product_id = checkout_data.get("buy_now_product_id")
                    product = Product.objects.get(id=product_id)
                    qty = int(checkout_data.get("buy_now_qty") or 1)
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=product.name,
                        quantity=qty,
                        price=product.price,
                        unit_price=product.price,
                        selected_size=checkout_data.get("buy_now_size", "N/A"),
                    )
                else:
                    for item_data in checkout_data.get("cart_items", []):
                        product = Product.objects.get(id=item_data["product_id"])
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            product_name=item_data["product_name"],
                            quantity=item_data["quantity"],
                            price=item_data["price"],
                            unit_price=item_data["unit_price"],
                            selected_size=item_data["selected_size"],
                        )
                    
                    # Empty the user's cart
                    Cart.objects.filter(user=pending_payment.user).delete()

                # Clean up the temporary pending payment session
                pending_payment.delete()

            # ✅ SEND ORDER CONFIRMATION EMAIL ASYNCHRONOUSLY
            from sportzone.email_utils import send_order_confirmation_email_async
            send_order_confirmation_email_async(order)

            return Response({
                "message": "Payment verified and order placed successfully.",
                "order_id": order.id
            })
        except razorpay.errors.SignatureVerificationError as e:
            logger.error("=== Razorpay Signature Verification Error ===")
            logger.error(f"Error Message: {str(e)}")
            logger.error("=============================================")
            return Response({"error": "Payment signature verification failed. Secure validation failed."}, status=400)
        except razorpay.errors.BadRequestError as e:
            logger.error("=== Razorpay BadRequestError (verify_payment) ===")
            logger.error(f"Error Message: {str(e)}")
            logger.error(traceback.format_exc())
            err_msg = str(e)
            if "Authentication failed" in err_msg or "auth" in err_msg.lower():
                return Response(
                    {"error": "Razorpay authentication failed. Please check if your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct and valid."},
                    status=401
                )
            return Response(
                {"error": f"Invalid request to Razorpay: {err_msg}"},
                status=400
            )
        except Exception as e:
            logger.error("=== Razorpay SDK Error (verify_payment) ===")
            logger.error(f"Error Type: {type(e).__name__}")
            logger.error(f"Error Message: {str(e)}")
            logger.error(traceback.format_exc())
            logger.error("==========================================")
            return Response({"error": f"An unexpected error occurred during verification: {str(e)}"}, status=400)

    # 🔥 CANCEL ORDER
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if order.status != "Pending":
            return Response(
                {"error": "Cannot cancel this order"},
                status=400
            )

        order.status = "Cancelled"
        order.save()

        return Response({"message": "Order cancelled successfully"})


class AdminOrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Order.objects.select_related("user")
        .prefetch_related("orderitem_set__product")
        .order_by("-created_at")
    )
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__email", "user__username"]
    ordering_fields = ["id", "created_at", "total_price", "status"]

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return AdminOrderStatusSerializer
        return AdminOrderSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        qs = super().get_queryset()
        st = self.request.query_params.get("status")
        if st:
            qs = qs.filter(status=st)
        df = self.request.query_params.get("date_from")
        dt = self.request.query_params.get("date_to")
        if df:
            qs = qs.filter(created_at__date__gte=df)
        if dt:
            qs = qs.filter(created_at__date__lte=dt)
        uid = self.request.query_params.get("user")
        if uid:
            qs = qs.filter(user_id=uid)
        return qs


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated, IsNotBlocked])
def wishlist_list(request):
    if request.method == "GET":
        serializer = WishlistProductSerializer(
            Wishlist.objects.filter(user=request.user).select_related("product", "product__category"),
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    product_id = request.data.get("product_id") or request.query_params.get("product_id")
    if not product_id:
        return Response({"error": "product_id is required"}, status=400)

    product = get_object_or_404(Product, id=product_id)

    if request.method == "POST":
        Wishlist.objects.get_or_create(user=request.user, product=product)
        return Response({"message": "Added to wishlist"})

    # DELETE
    Wishlist.objects.filter(user=request.user, product=product).delete()
    return Response({"message": "Removed from wishlist"})


# 🔥 TEMPORARY DEBUG RAZORPAY ENDPOINT
@api_view(["GET"])
@permission_classes([AllowAny])
def debug_razorpay(request):
    key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
    
    key_id_exists = bool(key_id)
    key_secret_exists = bool(key_secret)
    
    is_valid_format = False
    if key_id:
        is_valid_format = key_id.startswith("rzp_test_") or key_id.startswith("rzp_live_")
        
    return Response({
        "key_id_exists": key_id_exists,
        "key_secret_exists": key_secret_exists,
        "key_id_value": key_id,
        "is_valid_format": is_valid_format,
        "secret_length": len(key_secret) if key_secret else 0,
        "secret_preview": f"{key_secret[:5]}..." if key_secret and len(key_secret) >= 5 else None
    })