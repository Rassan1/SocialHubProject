from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class ChatRoom(models.Model):
    """Model for chat rooms between users"""

    ROOM_TYPES = [
        ('DIRECT', 'Direct Message'),
        ('GROUP', 'Group Chat'),
        ('EVENT', 'Event Chat'),
    ]

    name = models.CharField(_('name'), max_length=200, blank=True)
    room_type = models.CharField(
        _('room type'),
        max_length=10,
        choices=ROOM_TYPES,
        default='DIRECT'
    )

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='chat_rooms'
    )

    # For event-specific chats
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.CASCADE,
        related_name='chat_rooms',
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('chat room')
        verbose_name_plural = _('chat rooms')
        ordering = ['-updated_at']

    def __str__(self):
        if self.name:
            return self.name
        if self.room_type == 'DIRECT':
            participants = list(self.participants.all()[:2])
            if len(participants) == 2:
                return f"{participants[0].get_short_name()} & {participants[1].get_short_name()}"
        return f"Chat Room #{self.id}"

    @property
    def last_message(self):
        """Get the last message in this room"""
        return self.messages.first()


class Message(models.Model):
    """Model for individual messages in chat rooms"""

    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField(_('content'))

    # Attachments
    image = models.ImageField(
        upload_to='chat_images/',
        blank=True,
        null=True
    )

    # Message status
    is_read = models.BooleanField(_('is read'), default=False)
    read_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='read_messages',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('message')
        verbose_name_plural = _('messages')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['room', '-created_at']),
            models.Index(fields=['sender']),
        ]

    def __str__(self):
        return f"Message from {self.sender.get_short_name()} in {self.room}"
