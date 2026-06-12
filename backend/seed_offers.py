import datetime
from django.utils import timezone
from products.models import Offer

# Clear existing offers to start fresh
Offer.objects.all().delete()

# Create three premium offers
offers_data = [
    {
        "title": "Championship Kickoff Sale",
        "description": "Gear up like a pro. Get 20% off all soccer cleats, goalkeeper gloves, and elite training gear.",
        "discount_percent": 20.00,
        "promo_code": "KICKOFF20",
        "is_active": True,
        "starts_at": timezone.now(),
        "ends_at": timezone.now() + datetime.timedelta(days=7, hours=4, minutes=30),
    },
    {
        "title": "Summer Endurance Boost",
        "description": "Maximize your pace. Extra savings on running shoes, GPS smartwatches, and sweat-wicking apparel.",
        "discount_percent": 15.00,
        "promo_code": "ENDURE15",
        "is_active": True,
        "starts_at": timezone.now(),
        "ends_at": timezone.now() + datetime.timedelta(days=3, hours=12, minutes=15),
    },
    {
        "title": "Monsoon Cricket Mania",
        "description": "Dominate the pitch. 25% off English Willow bats, premium pads, helmets, and leather balls.",
        "discount_percent": 25.00,
        "promo_code": "CRICKET25",
        "is_active": True,
        "starts_at": timezone.now(),
        "ends_at": timezone.now() + datetime.timedelta(days=1, hours=2, minutes=0),
    }
]

for data in offers_data:
    Offer.objects.create(**data)

print(f"Successfully seeded {Offer.objects.count()} active offers.")
