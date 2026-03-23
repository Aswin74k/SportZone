from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Cart, Order, OrderItem
from .serializers import CartSerializer, OrderSerializer


# 🔥 CART VIEWSET
class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    # 🔥 Only logged-in user's cart
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

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
    permission_classes = [IsAuthenticated]

    # 🔥 Only user's orders
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    # 🔥 IMPORTANT (for full image URL)
    def get_serializer_context(self):
        return {"request": self.request}

    # 🔥 CHECKOUT API
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        user = request.user
        cart_items = Cart.objects.filter(user=user)

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        # 🔥 Calculate total
        total = sum(item.product.price * item.quantity for item in cart_items)

        # 🔥 Create Order
        order = Order.objects.create(
            user=user,
            total_price=total,
            status="Pending"
        )

        # 🔥 Create Order Items
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity
            )

        # 🔥 Clear cart
        cart_items.delete()

        return Response({"message": "Order placed successfully"})

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