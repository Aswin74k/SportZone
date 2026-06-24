from django.contrib.auth.models import User
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.CharField(
        max_length=80,
        unique=True,
        help_text="Lowercase key used in URLs and API filters (e.g. cricket, sports shoe).",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=120)
    logo = models.ImageField(upload_to="brands/")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="products/")
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    stock = models.PositiveIntegerField(default=0)
    is_trending = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_deal_of_the_week = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="gallery_images",
    )
    image = models.ImageField(upload_to="products/gallery/")

    def __str__(self):
        return f"{self.product.name} image {self.id}"


class ProductSize(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="sizes",
    )
    size = models.CharField(max_length=10)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - Size {self.size}"


class ProductReview(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="product_reviews",
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["product", "user"], name="unique_review_per_user_product")
        ]

    def __str__(self):
        return f"Review {self.id} on {self.product_id}"


class Banner(models.Model):
    BANNER_TYPE_CHOICES = [
        ("premium", "Premium Banner"),
        ("sale", "Sale/Promo Banner"),
        ("countdown", "Countdown Urgent Offer"),
        ("new_arrival", "New Arrival Spotlight"),
        ("sports", "Sports Athletic Theme"),
        ("minimal", "Luxury Minimalist"),
        ("full_width", "Full-width Hero Banner"),
    ]

    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=250, blank=True)
    image = models.ImageField(upload_to="banners/")
    link_url = models.URLField(blank=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="banners")
    
    # New template fields
    banner_type = models.CharField(max_length=30, choices=BANNER_TYPE_CHOICES, default="premium")
    linked_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="linked_banners")
    offer_percent = models.PositiveIntegerField(null=True, blank=True)
    cashback_text = models.CharField(max_length=150, blank=True)
    countdown_end = models.DateTimeField(null=True, blank=True)
    background_color = models.CharField(max_length=50, blank=True)
    button_text = models.CharField(max_length=50, blank=True, default="Shop Now")
    badge_text = models.CharField(max_length=100, blank=True)
    secondary_text = models.CharField(max_length=250, blank=True)
    
    description = models.TextField(blank=True)
    linked_category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="linked_banners")
    featured_products = models.ManyToManyField(Product, blank=True, related_name="featured_in_banners")
    
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-id"]

    def __str__(self):
        return self.title or f"Banner {self.id} ({self.get_banner_type_display()})"


class Offer(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    promo_code = models.CharField(max_length=64, blank=True)
    is_active = models.BooleanField(default=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.title
