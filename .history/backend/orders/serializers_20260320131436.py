from rest_framework import serializers
from .models import Cart, Order, OrderItem
from products.models import Product
from products.serializers import ProductSerializer


# 🔥 CART SERIALIZER
class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = Cart
        fields = ["id", "product", "product_id", "quantity"]


# 🔥 ORDER ITEM SERIALIZER (PRODUCTION LEVEL)
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_image",
            "product_price",
            "quantity"
        ]


# 🔥 ORDER SERIALIZER
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        source="orderitem_set",  # 🔥 IMPORTANT FIX
        many=True,
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "created_at",
            "total_price",
            "status",
            "items"
        ]