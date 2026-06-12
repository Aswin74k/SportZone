from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .admin_views import AdminUserViewSet
from .views import (
    register_user,
    login_user,
    forgot_password,
    verify_otp,
    reset_password,
    profile,
    AddressViewSet,
)

router = DefaultRouter()
router.register(r"admin/users", AdminUserViewSet, basename="admin-users")
router.register(r"addresses", AddressViewSet, basename="address")

urlpatterns = [
    path("register/", register_user),
    path("login/", login_user),
    path("profile/", profile),
    path("forgot-password/", forgot_password),
    path("verify-otp/", verify_otp),
    path("reset-password/", reset_password),
    path("", include(router.urls)),
]
