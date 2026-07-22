from django.urls import path
from .views import (
    ChatRoomListCreateView,
    ChatRoomDetailView,
    MessageListCreateView,
    MarkMessagesAsReadView,
    CreateDirectChatView,
    AddParticipantsView,
    RemoveParticipantView,
    AvailableUsersView,
    TypingIndicatorView
)

app_name = 'chat'

urlpatterns = [
    # Chat Rooms
    path('chat/rooms/', ChatRoomListCreateView.as_view(), name='chatroom-list-create'),
    path('chat/rooms/<int:pk>/', ChatRoomDetailView.as_view(), name='chatroom-detail'),
    path('chat/direct/', CreateDirectChatView.as_view(), name='create-direct-chat'),

    # Participants
    path('chat/rooms/<int:room_id>/participants/available/', AvailableUsersView.as_view(), name='available-users'),
    path('chat/rooms/<int:room_id>/participants/add/', AddParticipantsView.as_view(), name='add-participants'),
    path('chat/rooms/<int:room_id>/participants/remove/', RemoveParticipantView.as_view(), name='remove-participant'),

    # Messages
    path('chat/rooms/<int:room_id>/messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('chat/rooms/<int:room_id>/mark-read/', MarkMessagesAsReadView.as_view(), name='mark-messages-read'),

    # Typing Indicator
    path('chat/rooms/<int:room_id>/typing/', TypingIndicatorView.as_view(), name='typing-indicator'),
]
