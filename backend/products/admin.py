from django.contrib import admin

from .models import Banner, Brand, Category, Offer, Product, ProductImage, ProductReview, ProductSize


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "brand", "price", "stock", "is_trending", "is_new_arrival", "is_deal_of_the_week")
    list_filter = ("category", "brand", "is_trending", "is_new_arrival", "is_deal_of_the_week")
    search_fields = ("name", "description")
    inlines = [ProductImageInline, ProductSizeInline]


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "user", "rating", "is_approved", "created_at")
    list_filter = ("is_approved", "rating")
    search_fields = ("comment", "user__email", "product__name")


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "banner_type", "priority", "display_order", "is_active", "created_at")
    list_filter = ("is_active", "banner_type")


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ("title", "discount_percent", "promo_code", "is_active", "created_at")
    list_filter = ("is_active",)
