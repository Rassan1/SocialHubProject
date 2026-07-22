from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ChatRoom, Message
from .serializers import (
    ChatRoomSerializer,
    ChatRoomCreateSerializer,
    ChatRoomListSerializer,
    MessageSerializer,
    MessageCreateSerializer
)


class ChatRoomListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to list and create chat rooms
    GET /api/chat/rooms/
    POST /api/chat/rooms/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatRoomCreateSerializer
        return ChatRoomListSerializer

    def get_queryset(self):
        # Return only chat rooms where user is a participant
        return ChatRoom.objects.filter(
            participants=self.request.user
        ).order_by('-updated_at')


class ChatRoomDetailView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve a chat room
    GET /api/chat/rooms/<id>/
    """
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can only access rooms they're part of
        return ChatRoom.objects.filter(participants=self.request.user)


class MessageListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to list and create messages in a chat room
    GET /api/chat/rooms/<room_id>/messages/
    POST /api/chat/rooms/<room_id>/messages/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        room_id = self.kwargs.get('room_id')

        # Verify user is participant
        try:
            room = ChatRoom.objects.get(pk=room_id, participants=self.request.user)
        except ChatRoom.DoesNotExist:
            return Message.objects.none()

        return Message.objects.filter(room_id=room_id).order_by('created_at')

    def perform_create(self, serializer):
        room_id = self.kwargs.get('room_id')

        # Verify user is participant
        try:
            room = ChatRoom.objects.get(pk=room_id, participants=self.request.user)
        except ChatRoom.DoesNotExist:
            return Response({
                'error': 'Chat room not found or you are not a participant'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer.save(sender=self.request.user, room=room)


class MarkMessagesAsReadView(APIView):
    """
    API endpoint to mark messages as read
    POST /api/chat/rooms/<room_id>/mark-read/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_id):
        try:
            room = ChatRoom.objects.get(pk=room_id, participants=request.user)
        except ChatRoom.DoesNotExist:
            return Response({
                'error': 'Chat room not found or you are not a participant'
            }, status=status.HTTP_403_FORBIDDEN)

        # Mark all messages in this room as read by the current user
        messages = Message.objects.filter(room=room).exclude(sender=request.user)

        for message in messages:
            message.read_by.add(request.user)

        return Response({
            'message': f'Marked {messages.count()} messages as read'
        }, status=status.HTTP_200_OK)


class CreateDirectChatView(APIView):
    """
    API endpoint to create or get a direct chat with another user
    POST /api/chat/direct/
    Body: {"user_id": <id>}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        other_user_id = request.data.get('user_id')

        if not other_user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        from users.models import User
        try:
            other_user = User.objects.get(pk=other_user_id)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if direct chat already exists
        existing_chat = ChatRoom.objects.filter(
            room_type='DIRECT',
            participants=request.user
        ).filter(
            participants=other_user
        ).first()

        if existing_chat:
            return Response({
                'message': 'Chat room already exists',
                'chat_room': ChatRoomSerializer(existing_chat).data
            }, status=status.HTTP_200_OK)

        # Create new direct chat
        chat_room = ChatRoom.objects.create(room_type='DIRECT')
        chat_room.participants.add(request.user, other_user)

        return Response({
            'message': 'Chat room created',
            'chat_room': ChatRoomSerializer(chat_room).data
        }, status=status.HTTP_201_CREATED)


class AddParticipantsView(APIView):
    """
    API endpoint to add participants to a chat room
    POST /api/chat/rooms/<room_id>/participants/add/
    Body: {"user_ids": [1, 2, 3]}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_id):
        from users.models import User

        try:
            room = ChatRoom.objects.get(pk=room_id, participants=request.user)
        except ChatRoom.DoesNotExist:
            return Response({
                'error': 'Chat room not found or you are not a participant'
            }, status=status.HTTP_403_FORBIDDEN)

        # Only allow adding participants to GROUP or EVENT rooms
        if room.room_type == 'DIRECT':
            return Response({
                'error': 'Cannot add participants to direct chats'
            }, status=status.HTTP_400_BAD_REQUEST)

        user_ids = request.data.get('user_ids', [])
        if not user_ids:
            return Response({
                'error': 'user_ids is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(id__in=user_ids)
        if not users.exists():
            return Response({
                'error': 'No valid users found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Add participants
        room.participants.add(*users)

        return Response({
            'message': f'Added {users.count()} participant(s) to the room',
            'chat_room': ChatRoomSerializer(room).data
        }, status=status.HTTP_200_OK)


class RemoveParticipantView(APIView):
    """
    API endpoint to remove a participant from a chat room
    POST /api/chat/rooms/<room_id>/participants/remove/
    Body: {"user_id": <id>} or leave empty to remove yourself
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_id):
        from users.models import User

        try:
            room = ChatRoom.objects.get(pk=room_id, participants=request.user)
        except ChatRoom.DoesNotExist:
            return Response({
                'error': 'Chat room not found or you are not a participant'
            }, status=status.HTTP_403_FORBIDDEN)

        # Cannot leave direct chats
        if room.room_type == 'DIRECT':
            return Response({
                'error': 'Cannot leave direct chats'
            }, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.data.get('user_id')

        # If user_id is provided, remove that user; otherwise remove self
        if user_id:
            try:
                user_to_remove = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return Response({
                    'error': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            user_to_remove = request.user

        room.participants.remove(user_to_remove)

        # Delete room if no participants left
        if room.participants.count() == 0:
            room.delete()
            return Response({
                'message': 'Left the room. Room deleted as it has no participants.'
            }, status=status.HTTP_200_OK)

        return Response({
            'message': f'{user_to_remove.get_short_name()} removed from the room',
            'chat_room': ChatRoomSerializer(room).data
        }, status=status.HTTP_200_OK)


class AvailableUsersView(APIView):
    """
    API endpoint to get list of users that can be added to a chat room
    GET /api/chat/rooms/<room_id>/participants/available/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, room_id):
        from users.models import User
        from users.serializers import UserSerializer

        try:
            room = ChatRoom.objects.get(pk=room_id, participants=request.user)
        except ChatRoom.DoesNotExist:
            return Response({
                'error': 'Chat room not found or you are not a participant'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get all users except those already in the room
        current_participant_ids = room.participants.values_list('id', flat=True)
        available_users = User.objects.exclude(id__in=current_participant_ids)

        return Response({
            'users': UserSerializer(available_users, many=True).data
        }, status=status.HTTP_200_OK)


class TypingIndicatorView(APIView):
    """
    API endpoint to manage typing indicators
    POST /api/chat/rooms/<room_id>/typing/
    GET /api/chat/rooms/<room_id>/typing/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_id):
        """Set typing status"""
        from django.core.cache import cache

        try:
            room = ChatRoom.objects.get(pk=room_id, participants=request.user)
        except ChatRoom.DoesNotExist:
            return Response({
                'error': 'Chat room not found or you are not a participant'
            }, status=status.HTTP_403_FORBIDDEN)

        is_typing = request.data.get('is_typing', False)
        cache_key = f'typing_room_{room_id}_user_{request.user.id}'

        if is_typing:
            # Set typing status with 10 second expiration
            cache.set(cache_key, {
                'user_id': request.user.id,
                'username': request.user.get_full_name(),
                'first_name': request.user.first_name,
                'last_name': request.user.last_name
            }, 10)
        else:
            # Clear typing status
            cache.delete(cache_key)

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

    def get(self, request, room_id):
        """Get who's typing"""
        from django.core.cache import cache

        try:
            room = ChatRoom.objects.get(pk=room_id, participants=request.user)
        except ChatRoom.DoesNotExist:
            return Response({
                'error': 'Chat room not found or you are not a participant'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get all typing users for this room
        typing_users = []
        for participant in room.participants.all():
            if participant.id == request.user.id:
                continue  # Don't include yourself

            cache_key = f'typing_room_{room_id}_user_{participant.id}'
            typing_data = cache.get(cache_key)
            if typing_data:
                typing_users.append(typing_data)

        return Response({
            'typing_users': typing_users
        }, status=status.HTTP_200_OK)
