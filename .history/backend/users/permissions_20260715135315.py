from rest_framework.permissions import BasePermission
from .models import UserProfile


class IsNotBlocked(BasePermission):
    message = "Your account has been suspended."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        profile = UserProfile.objects.filter(user=request.user).first()

        if profile and profile.is_blocked:
            return False

        return True