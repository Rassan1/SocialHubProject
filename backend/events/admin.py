from django.contrib import admin
from .models import Event, EventComment


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin for Event model"""

    list_display = ['title', 'category', 'creator', 'location', 'start_time', 'attendee_count', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'is_cancelled', 'start_time', 'created_at']
    search_fields = ['title', 'description', 'location', 'creator__email', 'tags']
    date_hierarchy = 'start_time'
    ordering = ['-created_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'image')
        }),
        ('Event Details', {
            'fields': ('location', 'start_time', 'end_time', 'max_attendees')
        }),
        ('Creator & Attendees', {
            'fields': ('creator', 'attendees')
        }),
        ('Tags & Status', {
            'fields': ('tags', 'is_active', 'is_cancelled')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['attendees']

    def attendee_count(self, obj):
        return obj.attendees.count()
    attendee_count.short_description = 'Attendees'


@admin.register(EventComment)
class EventCommentAdmin(admin.ModelAdmin):
    """Admin for EventComment model"""

    list_display = ['event', 'author', 'content_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__email', 'event__title']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
