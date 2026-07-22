from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import NewsPost
from .serializers import (
    NewsPostSerializer,
    NewsPostCreateSerializer,
    NewsPostListSerializer
)


class NewsPostListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to list and create news posts
    GET /api/news/
    POST /api/news/ (staff only)
    """

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NewsPostCreateSerializer
        return NewsPostListSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = NewsPost.objects.filter(is_published=True)

        # Filter by accommodation provider
        provider = self.request.query_params.get('provider', None)
        if provider:
            queryset = queryset.filter(accommodation_provider=provider)
        elif hasattr(self.request.user, 'accommodation_provider') and self.request.user.accommodation_provider:
            # Show posts for user's provider or general posts (empty or null)
            from django.db.models import Q
            queryset = queryset.filter(
                Q(accommodation_provider='') |
                Q(accommodation_provider__isnull=True) |
                Q(accommodation_provider=self.request.user.accommodation_provider)
            )

        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)

        return queryset.order_by('-is_pinned', '-published_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NewsPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint to retrieve, update, or delete a news post
    GET /api/news/<id>/
    PUT/PATCH /api/news/<id>/ (staff only)
    DELETE /api/news/<id>/ (staff only)
    """
    queryset = NewsPost.objects.filter(is_published=True)
    serializer_class = NewsPostSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return NewsPostCreateSerializer
        return NewsPostSerializer

    def update(self, request, *args, **kwargs):
        news_post = self.get_object()

        # Only author or admin can update
        if news_post.author != request.user and not request.user.is_staff:
            return Response({
                'error': 'Only the author or staff can update this news post'
            }, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        news_post = self.get_object()

        # Only author or admin can delete
        if news_post.author != request.user and not request.user.is_staff:
            return Response({
                'error': 'Only the author or staff can delete this news post'
            }, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
