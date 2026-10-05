from django.urls import path

from .views import (
    MetaAccountView,
    MetaOAuthCallbackView,
    MetaOAuthURLView,
    MetaWebhookView,
)


urlpatterns = [
    path("oauth-url/", MetaOAuthURLView.as_view(), name="meta-oauth-url"),
    path("callback/", MetaOAuthCallbackView.as_view(), name="meta-oauth-callback"),
    path("account/", MetaAccountView.as_view(), name="meta-account"),
    path("webhook/", MetaWebhookView.as_view(), name="meta-webhook"),
]