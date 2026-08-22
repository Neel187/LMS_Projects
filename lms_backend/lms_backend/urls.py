from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.contacts.views import ContactViewSet
from apps.enquiries.views import EnquiryViewSet, SavedViewViewSet
from apps.meta_integration.views import MetaOAuthURLView, MetaOAuthCallbackView, MetaWebhookView
from apps.reports.views import DashboardStatsView

router = DefaultRouter()
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'enquiries', EnquiryViewSet, basename='enquiry')
router.register(r'saved-views', SavedViewViewSet, basename='saved-view')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('apps.authentication.urls')),
    
    # Direct Meta Connect OAuth Endpoints
    path('api/meta/oauth-url/', MetaOAuthURLView.as_view(), name='meta-oauth-url'),
    path('api/meta/callback/', MetaOAuthCallbackView.as_view(), name='meta-oauth-callback'),
    path('api/meta/webhook/', MetaWebhookView.as_view(), name='meta-webhook'),
    
    # Reports & Dashboard Analytics
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
