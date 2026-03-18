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


def generate_otp():
    return str(random.randint(100000, 999999))


@api_view(['POST'])
def register_user(request):

    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    if not name:
        return Response({"error": "Name is required"}, status=400)

    if not email:
        return Response({"error": "Email is required"}, status=400)

    if not password:
        return Response({"error": "Password is required"}, status=400)

    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name
    )

    # ✅ AUTO LOGIN AFTER SIGNUP
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # ✅ ADD NAME TO TOKEN
    access['name'] = user.first_name.split()[0]  # only first name

    return Response({
        "access": str(access),
        "refresh": str(refresh),
        "name": user.first_name
    })


# 🔥 LOGIN WITH EMAIL
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

        # 🔥 send name to frontend
        refresh['name'] = user.first_name

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    return Response({"error": "Invalid email or password"}, status=400)


# 🔥 FORGOT PASSWORD (OTP)
@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=400)

    otp = generate_otp()

    EmailOTP.objects.filter(email=email).delete()
    EmailOTP.objects.create(email=email, otp=otp)

    send_mail(
        "SportZone Password Reset",
        f"Your OTP is {otp}",
        "your_email@gmail.com",
        [email],
        fail_silently=False,
    )

    return Response({"message": "OTP sent successfully"})


# 🔥 VERIFY OTP
@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    record = EmailOTP.objects.filter(email=email, otp=otp).last()

    if not record:
        return Response({"error": "Invalid OTP"}, status=400)

    if now() - record.created_at > timedelta(minutes=5):
        return Response({"error": "OTP expired"}, status=400)

    return Response({"message": "OTP verified"})


# 🔥 RESET PASSWORD
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

    EmailOTP.objects.filter(email=email).delete()

    return Response({"message": "Password reset successful"})