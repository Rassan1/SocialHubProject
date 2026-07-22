from django.urls import path
from .views import (
    NewsPostListCreateView,
    NewsPostDetailView
)

app_name = 'news'

urlpatterns = [
    path('news/', NewsPostListCreateView.as_view(), name='newspost-list-create'),
    path('news/<int:pk>/', NewsPostDetailView.as_view(), name='newspost-detail'),
]
