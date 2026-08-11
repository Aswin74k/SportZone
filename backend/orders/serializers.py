from rest_framework import serializers
from .models import Cart, Order, OrderItem, Wishlist
from products.models import Product
from products.serializers import ProductSerializer


# CART
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

    def validate(self, attrs):
        product = attrs.get("product") or (self.instance.product if self.instance else None)
        size = attrs.get("size") or (self.instance.size if self.instance else "N/A")
        quantity = attrs.get("quantity") or (self.instance.quantity if self.instance else 1)

        if product and size:
            raw_size = str(size).strip()
            norm_size = raw_size if raw_size.upper() != "N/A" else "N/A"

            if norm_size == "N/A":
                avail = product.stock
            else:
                from products.models import ProductSize
                size_exists_for_product = ProductSize.objects.filter(product=product).exists()
                if size_exists_for_product:
                    ps = ProductSize.objects.filter(product=product, size__iexact=norm_size).first()
                    avail = ps.stock if ps else 0
                else:
                    avail = product.stock

            if quantity > avail:
                raise serializers.ValidationError(
                    {"quantity": f"Only {avail} items are available for this product/size."}
                )

        return attrs

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
            total_qty = existing.quantity + quantity
            raw_size = str(size).strip()
            norm_size = raw_size if raw_size.upper() != "N/A" else "N/A"

            if norm_size == "N/A":
                avail = product.stock
            else:
                from products.models import ProductSize
                size_exists_for_product = ProductSize.objects.filter(product=product).exists()
                if size_exists_for_product:
                    ps = ProductSize.objects.filter(product=product, size__iexact=norm_size).first()
                    avail = ps.stock if ps else 0
                else:
                    avail = product.stock

            if total_qty > avail:
                raise serializers.ValidationError(
                    f"Only {avail} items are available for this product/size."
                )

            existing.quantity = total_qty
            existing.save()
            return existing

        validated_data["user"] = user
        return super().create(validated_data)


# ORDER ITEM (FINAL FIX)
class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(read_only=True)
    product_price = serializers.DecimalField(
        source="price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    product_image = serializers.SerializerMethodField()
    product_id = serializers.IntegerField(source="product.id", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "product_price",
            "product_image",
            "quantity",
            "unit_price",
            "selected_size",
            "product_id"
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
            "items",
            "shipping_name",
            "shipping_phone",
            "shipping_address",
            "shipping_city",
            "shipping_state",
            "shipping_pincode",
            "payment_method",
            "payment_status",
            "payment_completed_at",
        ]


class AdminOrderSerializer(OrderSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ["user_email", "user_id"]


class AdminOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status"]

    def validate_status(self, value):
        allowed = {"Pending", "Shipped", "Delivered", "Cancelled"}
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(sorted(allowed))}")
        return value


# Wishlist (returns Product-like payload)

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
    category = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    original_price = serializers.DecimalField(
        source="product.original_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
        allow_null=True,
    )
    stock = serializers.IntegerField(source="product.stock", read_only=True)
    brand = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = [
            "id",
            "name",
            "price",
            "original_price",
            "description",
            "category",
            "image",
            "stock",
            "brand",
            "rating",
            "reviews_count",
        ]

    def get_category(self, obj):
        cat = getattr(obj.product, "category", None)
        if cat is None:
            return ""

            
        return getattr(cat, "slug", str(cat))

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.product.image:
            try:
                return request.build_absolute_uri(obj.product.image.url)
            except Exception:
                # Fallback to relative path if request context is missing
                return obj.product.image.url
        return None

    def get_brand(self, obj):
        brand = getattr(obj.product, "brand", None)
        if brand:
            return {
                "id": brand.id,
                "name": brand.name,
            }
        return None

    def get_rating(self, obj):
        reviews = obj.product.reviews.all()
        if not reviews.exists():
            return None
        total = sum(r.rating for r in reviews)
        return round(total / reviews.count(), 1)

    def get_reviews_count(self, obj):
        return obj.product.reviews.count()