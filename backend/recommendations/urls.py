from django.urls import path
from .views import RecommendedEventsView, SimilarEventsView

app_name = 'recommendations'

urlpatterns = [
    # Personalized recommendations
    path('events/', RecommendedEventsView.as_view(), name='recommended-events'),

    # Similar events
    path('events/<int:event_id>/similar/', SimilarEventsView.as_view(), name='similar-events'),
]
