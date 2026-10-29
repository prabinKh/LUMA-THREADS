from django.urls import re_path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileView

urlpatterns = [
    re_path(r"^register/?$", RegisterView.as_view(), name="account-register"),
    re_path(r"^login/?$", LoginView.as_view(), name="account-login"),
    re_path(r"^profile/?$", ProfileView.as_view(), name="account-profile"),
    re_path(r"^token/refresh/?$", TokenRefreshView.as_view(), name="token-refresh"),
]
