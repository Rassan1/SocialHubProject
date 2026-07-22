from django.contrib import admin
from .models import NewsPost


@admin.register(NewsPost)
class NewsPostAdmin(admin.ModelAdmin):
    """Admin for NewsPost model"""

    list_display = ['title', 'category', 'author', 'accommodation_provider', 'is_pinned', 'is_published', 'published_at']
    list_filter = ['category', 'is_pinned', 'is_published', 'accommodation_provider', 'published_at']
    search_fields = ['title', 'content', 'author__email', 'accommodation_provider']
    date_hierarchy = 'published_at'
    ordering = ['-is_pinned', '-published_at']

    fieldsets = (
        ('Post Information', {
            'fields': ('title', 'content', 'category', 'image')
        }),
        ('Author & Target', {
            'fields': ('author', 'accommodation_provider')
        }),
        ('Status', {
            'fields': ('is_pinned', 'is_published')
        }),
        ('Timestamps', {
            'fields': ('published_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['published_at', 'created_at', 'updated_at']
