
from .models import Product, ProductImage, ProductSize


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline, ProductSizeInline]

admin.site.register(Product, ProductAdmin)