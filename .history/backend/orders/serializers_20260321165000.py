from rest_framework import serializers
from .models import Cart, Order, OrderItem
from products.models import Product
from products.serializers import ProductSerializer


# CART
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


# ORDER ITEM
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.SerializerMethodField()
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

    def get_product_image(self, obj):
        request = self.context.get("request")
        if obj.product.image:
            return request.build_absolute_uri(obj.product.image.url)
        return None


# ORDER
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        source="orderitem_set",
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

    # 🔥 VERY IMPORTANT
    def to_representation(self, instance):
        self.fields['items'].context.update(self.context)
        return super().to_representation(instance)