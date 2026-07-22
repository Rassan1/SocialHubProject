from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.conf import settings
from .models import User
from .emails import send_verification_email
import secrets
from datetime import timedelta
from django.utils import timezone


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'bio',
            'profile_picture', 'university', 'accommodation_provider',
            'interests', 'email_verified', 'is_university_verified',
            'is_staff', 'is_superuser', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email_verified', 'is_university_verified', 'is_staff', 'is_superuser', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'first_name', 'last_name',
            'university', 'accommodation_provider', 'interests'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        if settings.ENFORCE_UNIVERSITY_EMAIL:
            email = attrs.get('email')
            email_domain = email.split('@')[-1]

            is_university_email = any(
                email_domain.endswith(domain)
                for domain in settings.ALLOWED_EMAIL_DOMAINS
            )

            if not is_university_email:
                raise serializers.ValidationError({
                    "email": f"Please use a university email address. Allowed domains: {', '.join(settings.ALLOWED_EMAIL_DOMAINS)}"
                })

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')

        verification_token = secrets.token_urlsafe(32)

        user = User.objects.create_user(
            password=password,
            verification_token=verification_token,
            verification_token_created=timezone.now(),
            email_verified=False,
            **validated_data
        )

        send_verification_email(user)

        return user


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

    def validate_token(self, value):
        try:
            user = User.objects.get(verification_token=value, email_verified=False)

            if user.verification_token_created:
                token_age = timezone.now() - user.verification_token_created
                if token_age > timedelta(hours=24):
                    raise serializers.ValidationError("Verification token has expired.")

            self.context['user'] = user
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid verification token.")


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'profile_picture',
            'university', 'accommodation_provider', 'interests'
        ]
