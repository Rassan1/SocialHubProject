from django.contrib import admin
from .models import ChatRoom, Message


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    """Admin for ChatRoom model"""

    list_display = ['id', 'name', 'room_type', 'participant_count', 'created_at']
    list_filter = ['room_type', 'created_at']
    search_fields = ['name', 'participants__email']
    ordering = ['-created_at']

    fieldsets = (
        ('Room Information', {
            'fields': ('name', 'room_type', 'participants', 'event')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['participants']

    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin for Message model"""

    list_display = ['id', 'room', 'sender', 'content_preview', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['content', 'sender__email', 'room__name']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    fieldsets = (
        ('Message Information', {
            'fields': ('room', 'sender', 'content', 'image')
        }),
        ('Status', {
            'fields': ('is_read', 'read_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['read_by']

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
