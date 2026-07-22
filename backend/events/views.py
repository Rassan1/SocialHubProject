from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from .models import Event, EventComment
from .serializers import (
    EventSerializer,
    EventCreateSerializer,
    EventListSerializer,
    EventCommentSerializer
)


class EventListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to list and create events
    GET /api/events/
    POST /api/events/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateSerializer
        return EventListSerializer

    def get_queryset(self):
        queryset = Event.objects.filter(is_active=True, is_cancelled=False)

        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)

        # Search by title or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search) | Q(tags__icontains=search)
            )

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        if start_date:
            queryset = queryset.filter(start_time__gte=start_date)

        end_date = self.request.query_params.get('end_date', None)
        if end_date:
            queryset = queryset.filter(start_time__lte=end_date)

        # Filter upcoming events only
        upcoming = self.request.query_params.get('upcoming', None)
        if upcoming == 'true':
            queryset = queryset.filter(start_time__gte=timezone.now())

        # Filter events user is attending
        attending = self.request.query_params.get('attending', None)
        if attending == 'true':
            queryset = queryset.filter(attendees=self.request.user)

        # Filter events user created
        my_events = self.request.query_params.get('my_events', None)
        if my_events == 'true':
            queryset = queryset.filter(creator=self.request.user)

        return queryset.order_by('start_time')

    def perform_create(self, serializer):
        event = serializer.save(creator=self.request.user)
        # Automatically add creator as an attendee
        event.attendees.add(self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint to retrieve, update, or delete an event
    GET /api/events/<id>/
    PUT/PATCH /api/events/<id>/
    DELETE /api/events/<id>/
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateSerializer
        return EventSerializer

    def update(self, request, *args, **kwargs):
        event = self.get_object()

        # Only creator can update
        if event.creator != request.user:
            return Response({
                'error': 'Only the event creator can update this event'
            }, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        event = self.get_object()

        # Only creator can delete
        if event.creator != request.user:
            return Response({
                'error': 'Only the event creator can delete this event'
            }, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)


class EventJoinView(APIView):
    """
    API endpoint to join an event
    POST /api/events/<id>/join/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({
                'error': 'Event not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if user can join
        if not event.can_user_join(request.user):
            reasons = []
            if event.is_cancelled:
                reasons.append('Event is cancelled')
            if not event.is_active:
                reasons.append('Event is not active')
            if event.attendees.filter(id=request.user.id).exists():
                reasons.append('You are already attending this event')
            if event.is_full:
                reasons.append('Event is full')

            return Response({
                'error': 'Cannot join event',
                'reasons': reasons
            }, status=status.HTTP_400_BAD_REQUEST)

        # Add user to attendees
        event.attendees.add(request.user)

        return Response({
            'message': 'Successfully joined event',
            'event': EventSerializer(event, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class EventLeaveView(APIView):
    """
    API endpoint to leave an event
    POST /api/events/<id>/leave/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({
                'error': 'Event not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if user is attending
        if not event.attendees.filter(id=request.user.id).exists():
            return Response({
                'error': 'You are not attending this event'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Remove user from attendees
        event.attendees.remove(request.user)

        return Response({
            'message': 'Successfully left event',
            'event': EventSerializer(event, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class EventCommentListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to list and create event comments
    GET /api/events/<id>/comments/
    POST /api/events/<id>/comments/
    """
    serializer_class = EventCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        event_id = self.kwargs.get('pk')
        return EventComment.objects.filter(event_id=event_id)

    def perform_create(self, serializer):
        event_id = self.kwargs.get('pk')
        serializer.save(author=self.request.user, event_id=event_id)


class EventCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint to retrieve, update, or delete a comment
    GET /api/events/comments/<id>/
    PUT/PATCH /api/events/comments/<id>/
    DELETE /api/events/comments/<id>/
    """
    queryset = EventComment.objects.all()
    serializer_class = EventCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        comment = self.get_object()

        # Only author can update
        if comment.author != request.user:
            return Response({
                'error': 'Only the comment author can update this comment'
            }, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()

        # Only author can delete
        if comment.author != request.user:
            return Response({
                'error': 'Only the comment author can delete this comment'
            }, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
