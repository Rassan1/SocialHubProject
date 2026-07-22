import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Events.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/events');
      return;
    }
    fetchEventDetails();
    fetchComments();
  }, [id, navigate]);

  const fetchEventDetails = async () => {
    try {
      const response = await eventAPI.get(id);
      setEvent(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await eventAPI.comments.list(id);
      const commentsData = response.data.results || response.data;
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (err) {
      setComments([]);
    }
  };

  const handleJoinLeave = async () => {
    try {
      setJoining(true);
      setError('');
      setSuccess('');

      const wasAttending = isUserAttending();

      let response;
      if (wasAttending) {
        response = await eventAPI.leave(id);
        setSuccess('Successfully left the event!');
      } else {
        response = await eventAPI.join(id);
        setSuccess('Successfully joined the event!');
      }

      // Update event state with the response data
      if (response.data.event) {
        setEvent(response.data.event);
      } else {
        // Fallback: fetch event details if response doesn't contain event data
        await fetchEventDetails();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.reasons?.join(', ') || 'Failed to update attendance.');
      setSuccess('');
    } finally {
      setJoining(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await eventAPI.comments.create(id, { event: parseInt(id), content: newComment });
      setNewComment('');
      await fetchComments();
    } catch (err) {
      setError(err.response?.data?.content?.[0] || err.response?.data?.detail || 'Failed to post comment.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventAPI.delete(id);
      navigate('/events');
    } catch (err) {
      setError('Failed to delete event.');
    }
  };

  const isUserAttending = () => {
    return event?.is_attending || false;
  };

  const isCreator = () => {
    return event?.creator?.id === user?.id;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <Link to="/events" className="btn btn-secondary">Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="event-detail-header">
        <Link to="/events" className="back-link">← Back to Events</Link>
        {isCreator() && (
          <div className="event-actions">
            <Link to={`/events/${id}/edit`} className="btn btn-secondary">Edit</Link>
            <button onClick={handleDeleteEvent} className="btn btn-danger">Delete</button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {event && (
        <>
          <div className="event-detail-card">
            {event.image && (
              <div className="event-detail-image">
                <img src={event.image} alt={event.title} />
              </div>
            )}

            <div className="event-detail-content">
              <div className="event-meta">
                <span className={`category-badge category-${event.category.toLowerCase()}`}>
                  {event.category === 'SOCIAL' ? 'Social' :
                   event.category === 'SPORTS' ? 'Sports' :
                   event.category === 'STUDY' ? 'Study' :
                   event.category === 'FOOD' ? 'Food' :
                   event.category === 'ENTERTAINMENT' ? 'Entertainment' :
                   event.category === 'CULTURAL' ? 'Cultural' :
                   event.category === 'WELLNESS' ? 'Wellness' :
                   event.category === 'OTHER' ? 'Other' : event.category}
                </span>
                <span className="event-status">
                  {event.is_cancelled ? '❌ Cancelled' : '✅ Active'}
                </span>
              </div>

              <h1>{event.title}</h1>
              <p className="event-description-full">{event.description}</p>

              <div className="event-info-grid">
                <div className="info-card">
                  <span className="info-icon">📍</span>
                  <div>
                    <div className="info-label">Location</div>
                    <div className="info-value">{event.location}</div>
                  </div>
                </div>

                <div className="info-card">
                  <span className="info-icon">🕐</span>
                  <div>
                    <div className="info-label">Start Time</div>
                    <div className="info-value">{formatDate(event.start_time)}</div>
                  </div>
                </div>

                <div className="info-card">
                  <span className="info-icon">🕐</span>
                  <div>
                    <div className="info-label">End Time</div>
                    <div className="info-value">{formatDate(event.end_time)}</div>
                  </div>
                </div>

                <div className="info-card">
                  <span className="info-icon">👥</span>
                  <div>
                    <div className="info-label">Attendees</div>
                    <div className="info-value">
                      {event.attendee_count}
                      {event.max_attendees ? ` / ${event.max_attendees}` : ' (Unlimited)'}
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <span className="info-icon">👤</span>
                  <div>
                    <div className="info-label">Organizer</div>
                    <div className="info-value">
                      {event.creator.first_name} {event.creator.last_name}
                    </div>
                  </div>
                </div>

                {event.tags && (
                  <div className="info-card full-width">
                    <span className="info-icon">🏷️</span>
                    <div>
                      <div className="info-label">Tags</div>
                      <div className="tags-list">
                        {event.tags.split(',').map((tag, index) => (
                          <span key={index} className="tag">{tag.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isCreator() ? (
                <div className="creator-attending-message">
                  <span className="info-badge">
                    ✓ You are the event creator
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleJoinLeave}
                  disabled={joining || event.is_cancelled}
                  className={`btn ${isUserAttending() ? 'btn-danger' : 'btn-primary'} btn-join`}
                >
                  {joining ? 'Processing...' : isUserAttending() ? 'Leave Event' : 'Join Event'}
                </button>
              )}
            </div>
          </div>

          <div className="comments-section">
            <h2>Comments ({comments.length})</h2>

            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this event..."
                rows="3"
              />
              <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
                Post Comment
              </button>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.author.first_name} {comment.author.last_name}
                      </span>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetail;
