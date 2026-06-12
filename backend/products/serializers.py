import json
from decimal import Decimal

from rest_framework import serializers

from .models import (
    Banner,
    Brand,
    Category,
    Offer,
    Product,
    ProductImage,
    ProductReview,
    ProductSize,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "is_active", "created_at"]
        read_only_fields = ["created_at"]


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ["size", "stock"]


class ProductReviewSerializer(serializers.ModelSerializer):
    """Create: authenticated. List shows approved only (non-staff) in view queryset."""

    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = ["id", "product", "user_name", "rating", "comment", "is_approved", "created_at"]
        read_only_fields = ["id", "is_approved", "created_at"]

    def get_user_name(self, obj):
        u = obj.user
        name = (u.first_name or "").strip()
        return name or u.username

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            if ProductReview.objects.filter(user=request.user, product=attrs["product"]).exists():
                raise serializers.ValidationError(
                    "You have already submitted a review for this product."
                )
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)


class ProductReviewModerationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = ProductReview
        fields = [
            "id",
            "product",
            "product_name",
            "user",
            "user_email",
            "rating",
            "comment",
            "is_approved",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "product",
            "product_name",
            "user",
            "user_email",
            "rating",
            "comment",
            "created_at",
        ]


class BrandSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Brand
        fields = ["id", "name", "logo", "is_active", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class ProductSerializer(serializers.ModelSerializer):
    """List/detail: category slug string matches legacy React (`p.category`)."""

    image = serializers.SerializerMethodField()
    category = serializers.CharField(source="category.slug", read_only=True)
    category_id = serializers.IntegerField(source="category.id", read_only=True)
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        source="brand",
        allow_null=True,
        required=False,
    )

    images = ProductImageSerializer(source="gallery_images", many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "original_price",
            "description",
            "category",
            "category_id",
            "brand",
            "brand_id",
            "stock",
            "is_trending",
            "is_new_arrival",
            "is_deal_of_the_week",
            "image",
            "images",
            "sizes",
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None


class BannerSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        allow_null=True,
        required=False,
    )
    linked_product = ProductSerializer(read_only=True)
    linked_product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="linked_product",
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "subtitle",
            "image",
            "link_url",
            "product",
            "product_id",
            "banner_type",
            "linked_product",
            "linked_product_id",
            "offer_percent",
            "cashback_text",
            "countdown_end",
            "background_color",
            "button_text",
            "badge_text",
            "secondary_text",
            "sort_order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = [
            "id",
            "title",
            "description",
            "discount_percent",
            "promo_code",
            "is_active",
            "starts_at",
            "ends_at",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class AdminProductWriteSerializer(serializers.ModelSerializer):
    """Staff create/update: multipart + optional `sizes_json` array string."""

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        source="brand",
        allow_null=True,
        required=False,
    )
    sizes_json = serializers.CharField(write_only=True, required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "original_price",
            "description",
            "category_id",
            "brand_id",
            "stock",
            "is_trending",
            "is_new_arrival",
            "is_deal_of_the_week",
            "image",
            "sizes_json",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        # 1. Primary image check
        if self.instance is None and not attrs.get("image"):
            raise serializers.ValidationError({"image": "Primary image is required when creating a product."})

        # 2. sizes_json validation and extraction
        raw = attrs.pop("sizes_json", "") or ""
        if isinstance(raw, str) and raw.strip():
            try:
                data = json.loads(raw)
            except json.JSONDecodeError as exc:
                raise serializers.ValidationError({"sizes_json": f"Invalid JSON: {exc}"}) from exc
            if not isinstance(data, list):
                raise serializers.ValidationError({"sizes_json": "Must be a JSON array."})
            attrs["_sizes_payload"] = data
        else:
            attrs["_sizes_payload"] = None
        return attrs

    def validate_price(self, value):
        if value < Decimal("0"):
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def _sync_sizes(self, product, sizes_payload):
        if sizes_payload is None:
            return
        product.sizes.all().delete()
        for row in sizes_payload:
            if not isinstance(row, dict):
                continue
            size = str(row.get("size", "")).strip()
            if not size:
                continue
            stock = int(row.get("stock", 0) or 0)
            ProductSize.objects.create(product=product, size=size, stock=max(stock, 0))

    def create(self, validated_data):
        sizes_payload = validated_data.pop("_sizes_payload", None)
        product = super().create(validated_data)
        self._sync_sizes(product, sizes_payload)
        return product

    def update(self, instance, validated_data):
        sizes_payload = validated_data.pop("_sizes_payload", None)
        product = super().update(instance, validated_data)
        if sizes_payload is not None:
            self._sync_sizes(product, sizes_payload)
        return product
