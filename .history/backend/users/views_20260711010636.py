from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
import random

from .models import EmailOTP, UserProfile
from .serializers import (
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)


def generate_otp():
    return str(random.randint(100000, 999999))


def jwt_user_display_name(user):
    name = (user.first_name or "").strip()
    return name.split()[0] if name else "User"


def user_auth_payload(user):
    return {"name": jwt_user_display_name(user), "is_staff": bool(user.is_staff)}


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

    # ✅ SEND WELCOME EMAIL ASYNCHRONOUSLY
    from sportzone.email_utils import send_welcome_email_async
    send_welcome_email_async(user)


    # ✅ AUTO LOGIN AFTER SIGNUP
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # ✅ ADD NAME TO TOKEN
    access["name"] = jwt_user_display_name(user)

    return Response({
        "access": str(access),
        "refresh": str(refresh),
        "name": user.first_name,
        "user": user_auth_payload(user),
    })

@api_view(['POST'])
def login_user(request):

    email = request.data.get('email')
    password = request.data.get('password')

    user_obj = User.objects.filter(email=email).first()

    if not user_obj:
        return Response({"error": "User not found"}, status=400)

    user = authenticate(username=user_obj.username, password=password)

    if user:
        profile = UserProfile.objects.filter(user=user).first()
        if profile and profile.is_blocked:
            return Response({"error": "Your account has been suspended."}, status=403)

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        access["name"] = jwt_user_display_name(user)

        return Response({
            "access": str(access),
            "refresh": str(refresh),
            "name": access["name"],
            "user": user_auth_payload(user),
        })

    return Response({"error": "Invalid credentials"}, status=400)


# 🔥 FORGOT PASSWORD (OTP)
@api_view(['POST'])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].lower().strip()
    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "Email not registered"}, status=400)

    otp = generate_otp()

    # Keep only one active OTP per user
    EmailOTP.objects.filter(user=user).delete()
    EmailOTP.objects.create(user=user, otp=otp, is_verified=False)

    try:
        subject = "SportZone Password Reset OTP"
        from_email = f"SportZone Support <{settings.EMAIL_HOST_USER}>"
        to = [user.email]

        text_body = f"Hi {user.first_name or user.username},\n\nYour OTP is {otp}. Valid for 5 minutes.\n\n- SportZone Support"
        html_body = render_to_string(
            "email/otp_email.html",
            {"user": user, "otp": otp},
        )

        msg = EmailMultiAlternatives(subject, text_body, from_email, to)
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
    except Exception:
        return Response({"error": "Failed to send OTP email"}, status=500)

    return Response({"message": "OTP sent successfully"})


# VERIFY OTP
@api_view(['POST'])
def verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].lower().strip()
    otp = serializer.validated_data["otp"]

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "Email not registered"}, status=400)

    record = EmailOTP.objects.filter(user=user, otp=otp).order_by("-created_at").first()
    if not record:
        return Response({"error": "Invalid OTP"}, status=400)

    if record.is_expired():
        return Response({"error": "OTP expired"}, status=400)

    record.is_verified = True
    record.save(update_fields=["is_verified"])

    return Response({"message": "OTP verified successfully"})


#  RESET PASSWORD
@api_view(['POST'])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].lower().strip()
    new_password = serializer.validated_data["new_password"]

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "Email not registered"}, status=400)

    otp_row = EmailOTP.objects.filter(user=user).order_by("-created_at").first()
    if not otp_row:
        return Response({"error": "OTP verification required"}, status=400)

    if otp_row.is_expired():
        otp_row.delete()
        return Response({"error": "OTP expired"}, status=400)

    if not otp_row.is_verified:
        return Response({"error": "OTP not verified"}, status=400)

    user.set_password(new_password)
    user.save()

    # Clear OTP after successful password reset
    EmailOTP.objects.filter(user=user).delete()

    return Response({"message": "Password reset successful"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    name = (user.first_name or "").strip()
    if not name:
        name = user.username
    profile = UserProfile.objects.filter(user=user).first()
    return Response(
        {
            "username": name,
            "email": user.email,
            "is_staff": bool(user.is_staff),
            "is_blocked": profile.is_blocked if profile else False,
        }
    )


from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Address
from .serializers import AddressSerializer

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="set-default")
    def set_default(self, request, pk=None):
        address = self.get_object()
        address.is_default = True
        address.save()
        return Response({"message": "Address set as default successfully."})