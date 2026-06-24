from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(min_length=6, write_only=True)


class AdminUserSerializer(serializers.ModelSerializer):
    is_blocked = serializers.BooleanField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "is_active",
            "is_staff",
            "date_joined",
            "is_blocked",
        ]
        read_only_fields = ["id", "email", "username", "first_name", "date_joined", "is_staff"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            data["is_blocked"] = instance.profile.is_blocked
        except UserProfile.DoesNotExist:
            data["is_blocked"] = False
        return data

    def update(self, instance, validated_data):
        is_blocked = validated_data.pop("is_blocked", None)
        user = super().update(instance, validated_data)
        if is_blocked is not None:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.is_blocked = bool(is_blocked)
            profile.save(update_fields=["is_blocked", "updated_at"])
        return user


from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "full_name",
            "phone",
            "house_name",
            "area",
            "city",
            "district",
            "state",
            "pincode",
            "landmark",
            "address_type",
            "is_default",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
