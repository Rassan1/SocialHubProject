from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class NewsPost(models.Model):
    """Model for accommodation provider news posts"""

    NEWS_CATEGORIES = [
        ('ANNOUNCEMENT', 'Announcement'),
        ('MAINTENANCE', 'Maintenance'),
        ('EVENT', 'Event'),
        ('UPDATE', 'Update'),
        ('ALERT', 'Alert'),
    ]

    title = models.CharField(_('title'), max_length=300)
    content = models.TextField(_('content'))
    category = models.CharField(
        _('category'),
        max_length=20,
        choices=NEWS_CATEGORIES,
        default='ANNOUNCEMENT'
    )

    # Author (staff member)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='news_posts'
    )

    # Which accommodation provider this news is for
    accommodation_provider = models.CharField(
        _('accommodation provider'),
        max_length=200,
        help_text=_('Leave blank for all providers')
    ,
        blank=True
    )

    # Optional image
    image = models.ImageField(
        upload_to='news_images/',
        blank=True,
        null=True
    )

    # Priority and visibility
    is_pinned = models.BooleanField(_('is pinned'), default=False)
    is_published = models.BooleanField(_('is published'), default=True)

    # Timestamps
    published_at = models.DateTimeField(_('published at'), auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('news post')
        verbose_name_plural = _('news posts')
        ordering = ['-is_pinned', '-published_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['accommodation_provider']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.title
