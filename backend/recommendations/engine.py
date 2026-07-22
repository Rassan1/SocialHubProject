"""
Content-based recommendation engine for events
Uses TF-IDF and Cosine Similarity for lightweight ML recommendations
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from django.core.cache import cache
from events.models import Event


class EventRecommendationEngine:
    """
    Lightweight ML-based recommendation engine using content similarity
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            ngram_range=(1, 2)
        )

    def _create_event_content(self, event):
        """
        Combine event fields into a single text representation
        """
        content_parts = [
            event.title or '',
            event.description or '',
            event.category or '',
            event.location or '',
            event.tags or '',
        ]
        return ' '.join(filter(None, content_parts))

    def _get_user_event_history(self, user):
        """
        Get events the user has created or joined
        """
        # Events user created
        created_events = Event.objects.filter(creator=user)

        # Events user is attending (using the attendees M2M field)
        attending_events = user.attending_events.all()

        # Combine and get unique events
        user_events = list(created_events) + list(attending_events)
        return list({event.id: event for event in user_events}.values())

    def get_recommendations(self, user, limit=10):
        """
        Get personalized event recommendations for a user

        Args:
            user: The user to get recommendations for
            limit: Maximum number of recommendations to return

        Returns:
            List of recommended Event objects
        """
        # Check cache first
        cache_key = f'recommendations_user_{user.id}'
        cached_recommendations = cache.get(cache_key)
        if cached_recommendations:
            return cached_recommendations

        # Get user's event history
        user_events = self._get_user_event_history(user)

        # Get all upcoming events (excluding ones user already joined/created)
        user_event_ids = [event.id for event in user_events]
        all_events = Event.objects.exclude(
            id__in=user_event_ids
        ).filter(
            is_cancelled=False
        ).order_by('-created_at')

        # If no user history, return popular/recent events
        if not user_events or not all_events:
            recommendations = list(all_events[:limit])
            cache.set(cache_key, recommendations, 300)  # Cache for 5 minutes
            return recommendations

        try:
            # Convert QuerySet to list for indexing
            all_events_list = list(all_events)

            # Create content representations
            user_event_contents = [self._create_event_content(e) for e in user_events]
            all_event_contents = [self._create_event_content(e) for e in all_events_list]

            # Combine all content for vectorization
            all_contents = user_event_contents + all_event_contents

            # Create TF-IDF vectors
            tfidf_matrix = self.vectorizer.fit_transform(all_contents)

            # Split back into user and candidate events
            user_vectors = tfidf_matrix[:len(user_events)]
            candidate_vectors = tfidf_matrix[len(user_events):]

            # Calculate average user preference vector
            user_profile = np.mean(user_vectors.toarray(), axis=0).reshape(1, -1)

            # Calculate similarity with all candidate events
            similarities = cosine_similarity(user_profile, candidate_vectors)[0]

            # Get top N most similar events
            top_indices = np.argsort(similarities)[::-1][:limit]

            recommendations = [all_events_list[i] for i in top_indices]

            # Cache recommendations
            cache.set(cache_key, recommendations, 300)  # Cache for 5 minutes

            return recommendations

        except Exception as e:
            # Fallback to recent events if ML fails
            print(f"Recommendation engine error: {e}")
            recommendations = list(all_events[:limit])
            cache.set(cache_key, recommendations, 300)
            return recommendations

    def get_similar_events(self, event, limit=5):
        """
        Get events similar to a specific event

        Args:
            event: The event to find similar events for
            limit: Maximum number of similar events to return

        Returns:
            List of similar Event objects
        """
        # Check cache
        cache_key = f'similar_events_{event.id}'
        cached_similar = cache.get(cache_key)
        if cached_similar:
            return cached_similar

        # Get all other events
        other_events = Event.objects.exclude(
            id=event.id
        ).filter(
            is_cancelled=False
        )[:50]  # Limit to recent 50 events for performance

        if not other_events:
            return []

        try:
            # Convert QuerySet to list for indexing
            other_events_list = list(other_events)

            # Create content representations
            target_content = self._create_event_content(event)
            other_contents = [self._create_event_content(e) for e in other_events_list]

            all_contents = [target_content] + other_contents

            # Create TF-IDF vectors
            tfidf_matrix = self.vectorizer.fit_transform(all_contents)

            # Calculate similarity
            target_vector = tfidf_matrix[0]
            other_vectors = tfidf_matrix[1:]

            similarities = cosine_similarity(target_vector, other_vectors)[0]

            # Get top N most similar events
            top_indices = np.argsort(similarities)[::-1][:limit]

            similar_events = [other_events_list[i] for i in top_indices]

            # Cache results
            cache.set(cache_key, similar_events, 600)  # Cache for 10 minutes

            return similar_events

        except Exception as e:
            print(f"Similar events error: {e}")
            return list(other_events[:limit])
