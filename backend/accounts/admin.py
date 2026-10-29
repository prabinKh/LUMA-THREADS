from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "first_name", "last_name", "phone", "is_staff", "is_superuser")
    search_fields = ("email", "username", "first_name", "last_name", "phone")
    ordering = ("email",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Customer Info", {"fields": ("phone", "address", "city", "postal_code", "country")}),
    )
