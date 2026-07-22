from rest_framework import serializers
from .models import Event, EventComment
from users.serializers import UserSerializer


class EventCommentSerializer(serializers.ModelSerializer):
    """Serializer for Event Comments"""

    author = UserSerializer(read_only=True)

    class Meta:
        model = EventComment
        fields = ['id', 'event', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class EventSerializer(serializers.ModelSerializer):
    """Serializer for Event model"""

    creator = UserSerializer(read_only=True)
    attendee_count = serializers.SerializerMethodField()
    is_attending = serializers.SerializerMethodField()
    available_spots = serializers.SerializerMethodField()
    comments = EventCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 'location',
            'start_time', 'end_time', 'max_attendees', 'creator',
            'attendee_count', 'is_attending', 'available_spots',
            'tags', 'image', 'is_active', 'is_cancelled',
            'comments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'attendee_count', 'is_attending', 'available_spots', 'created_at', 'updated_at']

    def get_attendee_count(self, obj):
        return obj.attendees.count()

    def get_is_attending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False

    def get_available_spots(self, obj):
        return obj.available_spots

    def validate(self, attrs):
        # Validate that end_time is after start_time
        if 'start_time' in attrs and 'end_time' in attrs:
            if attrs['end_time'] <= attrs['start_time']:
                raise serializers.ValidationError({
                    "end_time": "End time must be after start time."
                })
        return attrs


class EventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating events"""

    class Meta:
        model = Event
        fields = [
            'title', 'description', 'category', 'location',
            'start_time', 'end_time', 'max_attendees',
            'tags', 'image'
        ]

    def validate(self, attrs):
        if attrs['end_time'] <= attrs['start_time']:
            raise serializers.ValidationError({
                "end_time": "End time must be after start time."
            })
        return attrs


class EventListSerializer(serializers.ModelSerializer):
    """Simplified serializer for event lists"""

    creator = UserSerializer(read_only=True)
    attendee_count = serializers.SerializerMethodField()
    is_attending = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'category', 'location', 'start_time',
            'end_time', 'creator', 'attendee_count', 'is_attending',
            'image', 'created_at'
        ]

    def get_attendee_count(self, obj):
        return obj.attendees.count()

    def get_is_attending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False
