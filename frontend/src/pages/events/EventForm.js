import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import './Events.css';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'SOCIAL',
    location: '',
    start_time: '',
    end_time: '',
    max_attendees: '',
    tags: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

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
    if (isEditMode && id) {
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.get(id);
      const event = response.data;
      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        start_time: event.start_time.slice(0, 16),
        end_time: event.end_time.slice(0, 16),
        max_attendees: event.max_attendees || '',
        tags: event.tags || ''
      });
    } catch (err) {
      setError('Failed to load event details.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';

    if (formData.start_time && formData.end_time) {
      if (new Date(formData.start_time) >= new Date(formData.end_time)) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    if (formData.max_attendees && formData.max_attendees < 1) {
      newErrors.max_attendees = 'Must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dataToSubmit = {
        ...formData,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
      };

      if (isEditMode) {
        await eventAPI.update(id, dataToSubmit);
        navigate(`/events/${id}`);
      } else {
        const response = await eventAPI.create(dataToSubmit);
        navigate(`/events/${response.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-header">
        <Link to={isEditMode ? `/events/${id}` : '/events'} className="back-link">
          ← Back
        </Link>
        <h1>{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
      </div>

      <div className="form-card">
        {error && (
          <div className="error-message general-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="e.g., Movie Night at the Common Room"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              rows="4"
              placeholder="Describe your event in detail..."
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'error' : ''}
                placeholder="e.g., Scape Common Room"
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">Start Time *</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={errors.start_time ? 'error' : ''}
              />
              {errors.start_time && <span className="error-text">{errors.start_time}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time *</label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={errors.end_time ? 'error' : ''}
              />
              {errors.end_time && <span className="error-text">{errors.end_time}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="max_attendees">Maximum Attendees (Optional)</label>
            <input
              type="number"
              id="max_attendees"
              name="max_attendees"
              value={formData.max_attendees}
              onChange={handleChange}
              className={errors.max_attendees ? 'error' : ''}
              min="1"
              placeholder="Leave empty for unlimited"
            />
            {errors.max_attendees && <span className="error-text">{errors.max_attendees}</span>}
            <span className="form-hint">Leave empty if there's no limit</span>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., movies, social, weekend (comma-separated)"
            />
            <span className="form-hint">Separate multiple tags with commas</span>
          </div>

          <div className="form-actions">
            <Link
              to={isEditMode ? `/events/${id}` : '/events'}
              className="btn btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
