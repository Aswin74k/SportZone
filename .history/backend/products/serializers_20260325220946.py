from rest_framework import serializers
from .models import Product, ProductImage, ProductSize


# 🔥 PRODUCT IMAGE
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


# 🔥 PRODUCT SIZE SERIALIZER
class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ["size", "stock"]


# 🔥 PRODUCT SERIALIZER
class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    images = ProductImageSerializer(
        source="gallery_images",
        many=True,
        read_only=True,
    )

    # 🔥 ADD THIS
    sizes = ProductSizeSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "description",
            "category",
            "stock",
            "image",
            "images",
            "sizes",  # 🔥 IMPORTANT
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None