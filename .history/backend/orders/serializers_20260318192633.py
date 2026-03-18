from rest_framework import serializers
from .models import Cart, Order, OrderItem
from products.models import Product

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