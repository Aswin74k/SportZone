from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import UserProfile, Address


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
    UserProfile.objects.get_or_create(user=instance)


@receiver(post_delete, sender=Address)
def set_new_default_address(sender, instance, **kwargs):
    if instance.is_default:
        next_address = Address.objects.filter(user=instance.user).first()
        if next_address:
            next_address.is_default = True
            next_address.save()
