import uuid
from urllib.parse import urlencode

import requests
from django.contrib.auth import authenticate
from django.conf import settings
from django.shortcuts import redirect
from .models import User
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import AccountSerializer, LoginSerializer, RegisterSerializer


def build_google_mobile(profile_sub: str) -> str:
    base = f"g{profile_sub[:14]}" if profile_sub else "ggoogleuser"
    return base[:15]


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.save()
        refresh = RefreshToken.for_user(account)
        return Response(
            {
                "token": str(refresh.access_token),
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": AccountSerializer(account).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["identifier"].strip()
        password = serializer.validated_data["password"]

        user = User.objects.filter(Q(email__iexact=identifier) | Q(mobile=identifier)).first()
        if not user:
            return Response({"detail": "Invalid login credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, email=user.email, password=password)
        if not user or not user.is_active:
            return Response({"detail": "Invalid login credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "token": str(refresh.access_token),
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": AccountSerializer(user).data,
            }
        )


class GoogleLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return Response(
                {"detail": "Google login is not configured on the server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account",
        }
        return redirect(
            "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
        )


class GoogleCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        error = request.query_params.get("error")
        if error:
            return redirect(f"{settings.FRONTEND_URL}/?google_error={error}")

        code = request.query_params.get("code")
        if not code:
            return redirect(f"{settings.FRONTEND_URL}/?google_error=missing_code")

        token_response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        token_data = token_response.json()
        if not token_response.ok or not token_data.get("access_token"):
            return redirect(f"{settings.FRONTEND_URL}/?google_error=token_exchange_failed")

        profile_response = requests.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
            timeout=10,
        )
        profile = profile_response.json()
        email = profile.get("email", "").lower()
        if not profile_response.ok or not email:
            return redirect(f"{settings.FRONTEND_URL}/?google_error=profile_failed")

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            google_sub = profile.get("sub") or uuid.uuid4().hex
            user = User.objects.create_user(
                email=email,
                password=uuid.uuid4().hex,
                first_name=profile.get("given_name", "Google"),
                last_name=profile.get("family_name", "User"),
                mobile=build_google_mobile(str(google_sub)),
                role=User.Role.EMPLOYEE,
                is_active=True,
            )

        refresh = RefreshToken.for_user(user)
        query = urlencode({
            "google_access": str(refresh.access_token),
            "google_refresh": str(refresh),
            "google_id": str(user.id),
            "google_first_name": user.first_name,
            "google_last_name": user.last_name,
            "google_email": user.email,
            "google_role": user.role,
        })
        return redirect(f"{settings.FRONTEND_URL}/?{query}")
