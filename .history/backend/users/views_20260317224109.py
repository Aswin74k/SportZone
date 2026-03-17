from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail
from django.utils.timezone import now
from datetime import timedelta
import random

from .models import EmailOTP


# 🔥 OTP GENERATOR
def generate_otp():
    return str(random.randint(100000, 999999))


# =========================
# 🔐 REGISTER
# =========================
@api_view(['POST'])
def register_user(request):

    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username:
        return Response({"error": "Username is required"}, status=400)

    if not email:
        return Response({"error": "Email is required"}, status=400)

    if not password:
        return Response({"error": "Password is required"}, status=400)

    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({
        "message": "Account created successfully",
        "username": user.username
    })


# =========================
# 🔑 LOGIN
# =========================
@api_view(['POST'])
def login_user(request):

    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({"error": "Email & password required"}, status=400)

    user_obj = User.objects.filter(email=email).first()

    if not user_obj:
        return Response({"error": "User not found"}, status=400)

    user = authenticate(username=user_obj.username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    return Response({"error": "Invalid email or password"}, status=400)

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=400)

    otp = generate_otp()

    # delete old OTP
    EmailOTP.objects.filter(email=email).delete()

    EmailOTP.objects.create(email=email, otp=otp)

    send_mail(
        "SportZone Password Reset",
        f"Your OTP is {otp}",
        "your_email@gmail.com",  # 🔥 replace with your email
        [email],
        fail_silently=False,
    )

    return Response({"message": "OTP sent successfully"})


@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    record = EmailOTP.objects.filter(email=email, otp=otp).last()

    if not record:
        return Response({"error": "Invalid OTP"}, status=400)

    # OTP expiry check (5 minutes)
    if now() - record.created_at > timedelta(minutes=5):
        return Response({"error": "OTP expired"}, status=400)

    return Response({"message": "OTP verified"})



@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=400)

    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    user.set_password(password)
    user.save()

    # delete OTP after success
    EmailOTP.objects.filter(email=email).delete()

    return Response({"message": "Password reset successful"})