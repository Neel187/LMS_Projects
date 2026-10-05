from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    GoogleCallbackView,
    GoogleLoginView,
    LoginView,
    ProfileView,
    RegisterView,
    EmployeeCreateView,
    EmployeeManagementView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("employees/", EmployeeCreateView.as_view(), name="employee-create"),
    path("employees/list/", EmployeeManagementView.as_view(), name="employee-management"),
    path("employees/<uuid:employee_id>/", EmployeeManagementView.as_view(), name="employee-detail"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("google/login/", GoogleLoginView.as_view(), name="google-login"),
    path("google/callback/", GoogleCallbackView.as_view(), name="google-callback"),
]
