from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from apps.contacts.views import ContactViewSet
from apps.enquiries.views import EnquiryViewSet, SavedViewViewSet

router = DefaultRouter()
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'enquiries', EnquiryViewSet, basename='enquiry')
router.register(r'saved-views', SavedViewViewSet, basename='saved-view')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/meta/', include('apps.meta_integration.urls')),
    path('api/dashboard/', include('apps.reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
