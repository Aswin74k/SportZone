from django.urls import path
from .views import forgot_password, verify_otp, reset_password


urlpatterns = [
    path('register/', register_user),
    path('login/', login_user),

    # 🔥 ADD THIS
    path('forgot-password/', forgot_password),
    path('verify-otp/', verify_otp),
    path('reset-password/', reset_password),
]