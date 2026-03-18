from django.urls import path
from .views import register_user, login_user, forgot_password, verify_otp, reset_password

urlpatterns = [
    path('register/', register_user),
    path('login/', login_user),

    # 🔥 forgot password
    path('forgot-password/', forgot_password),
    path('verify-otp/', verify_otp),
    path('reset-password/', reset_password),
]