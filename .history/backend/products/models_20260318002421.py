from django.db import models

class Product(models.Model):

    CATEGORY_CHOICES = [
        ('football','Football'),
        ('cricket','Cricket'),
        ('badminton','Badminton'),
        ('gym','Gym'),
        ('basketball','Basketball'),
        ('volleyball','Volleyball'),
        ('tennis','Tennis'),
        ('hockey')
    ]

    name = models.CharField(max_length=200)

    price = models.DecimalField(max_digits=10, decimal_places=2)

    description = models.TextField(blank=True)

    image = models.ImageField(upload_to='products/')

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    def __str__(self):
        return self.name