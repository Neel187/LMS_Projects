import uuid
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Company, User


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "mobile",
            "email",
            "role",
            "is_active",
            "company_id",
            "created_at",
            "updated_at",
            "last_login",
        ]


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    mobile = serializers.CharField(max_length=30)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices)
    is_active = serializers.BooleanField(default=True)
    company_id = serializers.UUIDField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_mobile(self, value):
        if User.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("An account with this mobile number already exists.")
        return value

    def validate_company_id(self, value):
        if value is None:
            return value
        if not Company.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Select an existing company.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        company_id = validated_data.pop("company_id", None)

        if company_id is None:
            company = Company.objects.filter(name="Default Company").first()
            if company is None:
                company = Company.objects.create(
                    id=uuid.uuid4(),
                    name="Default Company",
                    created_at=timezone.now(),
                    updated_at=timezone.now(),
                )
            company_id = company.id

        validated_data["company_id"] = company_id
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)
