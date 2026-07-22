from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.conf import settings
from .models import User
from .emails import send_password_reset_email, send_welcome_email
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    EmailVerificationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserProfileUpdateSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        response_data = {
            'message': 'Registration successful. Please check your email to verify your account.',
            'user': UserSerializer(user).data,
        }

        if settings.DEBUG:
            response_data['verification_token'] = user.verification_token

        return Response(response_data, status=status.HTTP_201_CREATED)


class EmailVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.context['user']
        user.email_verified = True
        user.verification_token = ''
        user.save()

        send_welcome_email(user)

        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Email verified successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({
                'error': 'Please provide both email and password'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not user.email_verified:
            return Response({
                'error': 'Please verify your email before logging in',
                'email_verified': False
            }, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception as e:
                    print(f"Token blacklist error (non-critical): {e}")

            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            import secrets
            reset_token = secrets.token_urlsafe(32)
            user.verification_token = reset_token
            user.verification_token_created = timezone.now()
            user.save()

            send_password_reset_email(user, reset_token)

            response_data = {
                'message': 'Password reset link sent to your email'
            }

            if settings.DEBUG:
                response_data['reset_token'] = reset_token

            return Response(response_data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'message': 'If the email exists, a password reset link has been sent'
            }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(verification_token=token)

            from datetime import timedelta
            if user.verification_token_created:
                token_age = timezone.now() - user.verification_token_created
                if token_age > timedelta(hours=24):
                    return Response({
                        'error': 'Password reset token has expired'
                    }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(password)
            user.verification_token = ''
            user.save()

            return Response({
                'message': 'Password reset successful'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid password reset token'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    queryset = User.objects.filter(is_active=True, email_verified=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            )

        provider = self.request.query_params.get('provider', None)
        if provider:
            queryset = queryset.filter(accommodation_provider=provider)

        university = self.request.query_params.get('university', None)
        if university:
            queryset = queryset.filter(university=university)

        return queryset


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True, email_verified=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
