from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from events.serializers import EventSerializer
from events.models import Event
from .engine import EventRecommendationEngine


class RecommendedEventsView(APIView):
    """
    API endpoint to get personalized event recommendations
    GET /api/recommendations/events/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get personalized event recommendations for the authenticated user"""
        try:
            # Get limit from query params (default 10)
            limit = int(request.query_params.get('limit', 10))
            limit = min(limit, 50)  # Max 50 recommendations

            # Get recommendations using ML engine
            engine = EventRecommendationEngine()
            recommended_events = engine.get_recommendations(request.user, limit=limit)

            # Serialize and return
            serializer = EventSerializer(recommended_events, many=True, context={'request': request})

            return Response({
                'count': len(recommended_events),
                'results': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to generate recommendations',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SimilarEventsView(APIView):
    """
    API endpoint to get events similar to a specific event
    GET /api/recommendations/events/<event_id>/similar/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, event_id):
        """Get events similar to the specified event"""
        try:
            # Get the target event
            try:
                event = Event.objects.get(pk=event_id)
            except Event.DoesNotExist:
                return Response({
                    'error': 'Event not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Get limit from query params (default 5)
            limit = int(request.query_params.get('limit', 5))
            limit = min(limit, 20)  # Max 20 similar events

            # Get similar events using ML engine
            engine = EventRecommendationEngine()
            similar_events = engine.get_similar_events(event, limit=limit)

            # Serialize and return
            serializer = EventSerializer(similar_events, many=True, context={'request': request})

            return Response({
                'event_id': event_id,
                'count': len(similar_events),
                'results': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to find similar events',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
