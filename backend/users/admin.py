from django.contrib import admin

from .models import EmailOTP, UserProfile, Address


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("user", "otp", "created_at", "is_verified")
    search_fields = ("user__email",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "is_blocked", "updated_at")
    list_filter = ("is_blocked",)
    search_fields = ("user__email", "user__username")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "city", "state", "pincode", "is_default", "created_at")
    list_filter = ("is_default", "state", "city")
    search_fields = ("full_name", "phone", "user__email", "city", "state", "pincode")
