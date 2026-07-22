from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model"""

    list_display = ['email', 'first_name', 'last_name', 'university', 'accommodation_provider', 'email_verified', 'is_staff', 'created_at']
    list_filter = ['email_verified', 'is_staff', 'is_superuser', 'is_active', 'accommodation_provider', 'university']
    search_fields = ['email', 'first_name', 'last_name', 'university', 'accommodation_provider']
    ordering = ['-created_at']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'bio', 'profile_picture')}),
        (_('Student info'), {'fields': ('university', 'accommodation_provider', 'interests')}),
        (_('Verification'), {'fields': ('email_verified', 'verification_token', 'verification_token_created')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    readonly_fields = ['created_at', 'updated_at', 'last_login']
