from rest_framework import serializers
from .models import Cart, Order, OrderItem, Wishlist
from products.models import Product
from products.serializers import ProductSerializer


# 🔥 CART
class CartSerializer(serializers.ModelSerializer):
    # Return nested product details (name, price, category, image url, etc.)
    product = ProductSerializer(read_only=True)

    # Accept product id on create/update
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True,
    )

    class Meta:
        model = Cart
        fields = ["id", "product", "product_id", "quantity", "size"]
        extra_kwargs = {
            "size": {"required": True, "error_messages": {"required": "Size is missing."}}
        }

    def validate_size(self, value):
        if not value or str(value).strip() == "":
            raise serializers.ValidationError("Size is missing.")
        return value

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1")
        return value

    def create(self, validated_data):
        """
        If the same product + size already exists in user's cart, increment quantity
        """
        request = self.context.get("request")
        user = request.user if request and hasattr(request, "user") else validated_data.get("user")
        product = validated_data.get("product")
        quantity = validated_data.get("quantity", 1)
        size = validated_data.get("size")

        if user is None or product is None or size is None:
            return super().create(validated_data)

        existing = Cart.objects.filter(user=user, product=product, size=size).first()
        if existing:
            existing.quantity += quantity
            existing.save()
            return existing

        validated_data["user"] = user
        return super().create(validated_data)


# 🔥 ORDER ITEM (FINAL FIX)
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_price",
            "product_image",
            "quantity"
        ]

    def get_product_image(self, obj):
        request = self.context.get("request")

        if obj.product.image:
            return request.build_absolute_uri(obj.product.image.url)

        return None


# 🔥 ORDER
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


# ---------------------------
# Wishlist (returns Product-like payload)
# ---------------------------
class WishlistProductSerializer(serializers.ModelSerializer):
    # Flatten wishlist -> product fields so frontend can reuse ProductCard UI
    id = serializers.IntegerField(source="product.id", read_only=True)
    name = serializers.CharField(source="product.name", read_only=True)
    price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    description = serializers.CharField(
        source="product.description",
        read_only=True,
    )
    category = serializers.CharField(
        source="product.category",
        read_only=True,
    )
    image = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ["id", "name", "price", "description", "category", "image"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.product.image:
            try:
                return request.build_absolute_uri(obj.product.image.url)
            except Exception:
                # Fallback to relative path if request context is missing
                return obj.product.image.url
        return None