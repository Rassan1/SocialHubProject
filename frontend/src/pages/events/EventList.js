import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI, recommendationsAPI } from '../../services/api';
import './Events.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    upcoming: true
  });

  const categories = [
    { value: 'SOCIAL', label: 'Social' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'STUDY', label: 'Study' },
    { value: 'FOOD', label: 'Food' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'WELLNESS', label: 'Wellness' },
    { value: 'OTHER', label: 'Other' }
  ];

  useEffect(() => {
    fetchEvents();
    fetchRecommendedEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRecommendedEvents = async () => {
    try {
      setLoadingRecommendations(true);
      const response = await recommendationsAPI.getRecommendedEvents(6);
      const recommendedData = response.data.results || [];
      setRecommendedEvents(Array.isArray(recommendedData) ? recommendedData : []);
    } catch (err) {
      setRecommendedEvents([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.upcoming) params.upcoming = 'true';

      const response = await eventAPI.list(params);
      const eventsData = response.data.results || response.data;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setError('');
    } catch (err) {
      setError('Failed to load events. Please try again.');
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableSpots = (event) => {
    if (!event.max_attendees) return 'Unlimited';
    const available = event.max_attendees - event.attendee_count;
    return available > 0 ? `${available} spots left` : 'Full';
  };

  if (loading && events.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Discover Events</h1>
          <p>Join social events and connect with students across accommodations</p>
        </div>
        <Link to="/events/create" className="btn btn-primary">
          <span>+ Create Event</span>
        </Link>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search events by title, description, or tags..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={filters.upcoming}
              onChange={(e) => handleFilterChange('upcoming', e.target.checked)}
            />
            <span>Upcoming events only</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* AI Recommended Events Section */}
      {!loadingRecommendations && recommendedEvents.length > 0 && !filters.category && !filters.search && (
        <div className="recommended-section">
          <div className="section-header">
            <h2>✨ Recommended for You</h2>
            <p>AI-powered suggestions based on your interests</p>
          </div>
          <div className="recommended-events-grid">
            {recommendedEvents.map(event => (
              <Link
                to={`/events/${event.id}`}
                key={event.id}
                className="event-card recommended-card"
              >
                {event.image && (
                  <div className="event-image">
                    <img src={event.image} alt={event.title} />
                  </div>
                )}
                <div className="event-content">
                  <div className="event-header-card">
                    <span className={`category-badge category-${event.category.toLowerCase()}`}>
                      {categories.find(c => c.value === event.category)?.label || event.category}
                    </span>
                    <span className="ai-badge">AI</span>
                  </div>

                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>

                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                  </div>

                  <div className="event-footer">
                    <span className="spots-available">
                      {getAvailableSpots(event)}
                    </span>
                    <span className="view-details">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Events Section */}
      <div className="section-header">
        <h2>All Events</h2>
      </div>

      {events.length === 0 && !loading ? (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <h3>No events found</h3>
          <p>Try adjusting your filters or create a new event!</p>
          <Link to="/events/create" className="btn btn-primary">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <Link
              to={`/events/${event.id}`}
              key={event.id}
              className="event-card"
            >
              {event.image && (
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                </div>
              )}
              <div className="event-content">
                <div className="event-header-card">
                  <span className={`category-badge category-${event.category.toLowerCase()}`}>
                    {categories.find(c => c.value === event.category)?.label || event.category}
                  </span>
                  <span className="attendee-count">
                    👥 {event.attendee_count}
                  </span>
                </div>

                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-details">
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🕐</span>
                    <span>{formatDate(event.start_time)}</span>
                  </div>
                </div>

                <div className="event-footer">
                  <span className="spots-available">
                    {getAvailableSpots(event)}
                  </span>
                  <span className="view-details">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
