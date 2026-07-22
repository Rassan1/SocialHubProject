from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    EventJoinView,
    EventLeaveView,
    EventCommentListCreateView,
    EventCommentDetailView
)

app_name = 'events'

urlpatterns = [
    # Events
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('events/<int:pk>/join/', EventJoinView.as_view(), name='event-join'),
    path('events/<int:pk>/leave/', EventLeaveView.as_view(), name='event-leave'),

    # Event Comments
    path('events/<int:pk>/comments/', EventCommentListCreateView.as_view(), name='event-comment-list'),
    path('events/comments/<int:pk>/', EventCommentDetailView.as_view(), name='event-comment-detail'),
]
