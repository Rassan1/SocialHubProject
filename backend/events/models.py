from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Event(models.Model):
    """Model for social events created by users"""

    EVENT_CATEGORIES = [
        ('SOCIAL', 'Social'),
        ('SPORTS', 'Sports & Fitness'),
        ('STUDY', 'Study Group'),
        ('FOOD', 'Food & Dining'),
        ('ENTERTAINMENT', 'Entertainment'),
        ('CULTURAL', 'Cultural'),
        ('WELLNESS', 'Wellness'),
        ('OTHER', 'Other'),
    ]

    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'))
    category = models.CharField(
        _('category'),
        max_length=20,
        choices=EVENT_CATEGORIES,
        default='SOCIAL'
    )

    # Event details
    location = models.CharField(_('location'), max_length=300)
    start_time = models.DateTimeField(_('start time'))
    end_time = models.DateTimeField(_('end time'))
    max_attendees = models.PositiveIntegerField(
        _('maximum attendees'),
        null=True,
        blank=True,
        help_text=_('Leave blank for unlimited')
    )

    # Creator and attendees
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_events'
    )
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='attending_events',
        blank=True
    )

    # For AI recommendations - tags
    tags = models.TextField(
        _('tags'),
        blank=True,
        help_text=_('Comma-separated tags for event categorization')
    )

    # Event image
    image = models.ImageField(
        upload_to='event_images/',
        blank=True,
        null=True
    )

    # Status
    is_active = models.BooleanField(_('is active'), default=True)
    is_cancelled = models.BooleanField(_('is cancelled'), default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('event')
        verbose_name_plural = _('events')
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['start_time']),
            models.Index(fields=['category']),
            models.Index(fields=['creator']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_full(self):
        """Check if event has reached maximum capacity"""
        if self.max_attendees is None:
            return False
        return self.attendees.count() >= self.max_attendees

    @property
    def available_spots(self):
        """Return number of available spots"""
        if self.max_attendees is None:
            return None
        return max(0, self.max_attendees - self.attendees.count())

    def can_user_join(self, user):
        """Check if user can join the event"""
        if self.is_cancelled:
            return False
        if not self.is_active:
            return False
        if self.attendees.filter(id=user.id).exists():
            return False
        if self.is_full:
            return False
        return True


class EventComment(models.Model):
    """Model for comments on events"""

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_comments'
    )
    content = models.TextField(_('content'))

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('event comment')
        verbose_name_plural = _('event comments')
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author} on {self.event}"
