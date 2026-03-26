from django.db import models

class Product(models.Model):

    CATEGORY_CHOICES = [
        ('football','Football'),
        ('cricket','Cricket'),
        ('badminton','Badminton'),
        ('basketball','Basketball'),
        ('volleyball','Volleyball'),
        ('tennis','Tennis'),
        ('hockey','Hockey'),
        ('sports cycle','Sports Cycle'),
        ('sports shone',)
    ]

    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='products/')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    # 🔥 Optional: keep or remove
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


# 🔥 MULTIPLE IMAGES
class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="gallery_images",
    )
    image = models.ImageField(upload_to="products/gallery/")

    def __str__(self):
        return f"{self.product.name} image {self.id}"


# 🔥 NEW: PRODUCT SIZE MODEL
class ProductSize(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="sizes"
    )
    size = models.CharField(max_length=10)  # 6,7,8,9,10
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - Size {self.size}"