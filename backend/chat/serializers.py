from rest_framework import serializers
from .models import ChatRoom, Message
from users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""

    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'room', 'sender', 'content', 'image',
            'is_read', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'created_at', 'updated_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""

    class Meta:
        model = Message
        fields = ['content', 'image']


class ChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for ChatRoom model"""

    participants = UserSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    participant_count = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'participants',
            'participant_count', 'event', 'last_message',
            'display_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_display_name(self, obj):
        """For DIRECT chats, return the other user's name. For GROUP chats, return room name."""
        if obj.room_type == 'DIRECT':
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                # Get the other participant (not the current user)
                other_user = obj.participants.exclude(id=request.user.id).first()
                if other_user:
                    return f"{other_user.first_name} {other_user.last_name}"
        return obj.name


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat rooms"""

    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = ChatRoom
        fields = ['name', 'room_type', 'event', 'participant_ids']

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        chat_room = ChatRoom.objects.create(**validated_data)

        # Add participants
        if participant_ids:
            from users.models import User
            participants = User.objects.filter(id__in=participant_ids)
            chat_room.participants.set(participants)

        # Add creator as participant
        request = self.context.get('request')
        if request and request.user:
            chat_room.participants.add(request.user)

        return chat_room


class ChatRoomListSerializer(serializers.ModelSerializer):
    """Simplified serializer for chat room lists"""

    last_message = MessageSerializer(read_only=True)
    participant_count = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'participant_count',
            'last_message', 'unread_count', 'display_name', 'updated_at'
        ]

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_display_name(self, obj):
        """For DIRECT chats, return the other user's name. For GROUP chats, return room name."""
        if obj.room_type == 'DIRECT':
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                # Get the other participant (not the current user)
                other_user = obj.participants.exclude(id=request.user.id).first()
                if other_user:
                    return f"{other_user.first_name} {other_user.last_name}"
        return obj.name

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.exclude(
                read_by=request.user
            ).exclude(
                sender=request.user
            ).count()
        return 0
