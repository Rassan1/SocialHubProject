from rest_framework import serializers
from .models import NewsPost
from users.serializers import UserSerializer


class NewsPostSerializer(serializers.ModelSerializer):
    """Serializer for NewsPost model"""

    author = UserSerializer(read_only=True)

    class Meta:
        model = NewsPost
        fields = [
            'id', 'title', 'content', 'category', 'author',
            'accommodation_provider', 'image', 'is_pinned',
            'is_published', 'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'published_at', 'created_at', 'updated_at']


class NewsPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating news posts"""

    class Meta:
        model = NewsPost
        fields = [
            'title', 'content', 'category', 'accommodation_provider',
            'image', 'is_pinned', 'is_published'
        ]


class NewsPostListSerializer(serializers.ModelSerializer):
    """Simplified serializer for news post lists"""

    author = UserSerializer(read_only=True)

    class Meta:
        model = NewsPost
        fields = [
            'id', 'title', 'content', 'category', 'author',
            'accommodation_provider', 'is_pinned',
            'published_at', 'created_at'
        ]
