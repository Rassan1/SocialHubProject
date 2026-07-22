import React, { useState, useEffect } from 'react';
import { newsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './News.css';

const News = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('');
  const [showCreateEdit, setShowCreateEdit] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'ANNOUNCEMENT',
    accommodation_provider: '',
    is_pinned: false
  });

  const categories = [
    { value: 'ANNOUNCEMENT', label: 'Announcement' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'EVENT', label: 'Event' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'ALERT', label: 'Alert' }
  ];

  const accommodationProviders = [
    'Scape',
    'Unite Students',
    'IQ Student Accommodation',
    'Fresh Student Living',
    'CRM Students',
    'Vita Student',
    'Other'
  ];

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = filter ? { category: filter } : {};
      const response = await newsAPI.list(params);
      const newsData = response.data.results || response.data;
      setNews(Array.isArray(newsData) ? newsData : []);
      setError('');
    } catch (err) {
      setError('Failed to load news. Please try again.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'ANNOUNCEMENT': '📢',
      'Announcement': '📢',
      'MAINTENANCE': '🔧',
      'Maintenance': '🔧',
      'EVENT': '🎉',
      'Event': '🎉',
      'UPDATE': '🔄',
      'Update': '🔄',
      'ALERT': '⚠️',
      'Alert': '⚠️'
    };
    return icons[category] || '📰';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'ANNOUNCEMENT': 'Announcement',
      'MAINTENANCE': 'Maintenance',
      'EVENT': 'Event',
      'UPDATE': 'Update',
      'ALERT': 'Alert'
    };
    return labels[category] || category;
  };

  const handleCreateClick = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      category: 'ANNOUNCEMENT',
      accommodation_provider: '',
      is_pinned: false
    });
    setShowCreateEdit(true);
  };

  const handleEditClick = (post) => {
    setEditingNews(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
      accommodation_provider: post.accommodation_provider || '',
      is_pinned: post.is_pinned
    });
    setShowCreateEdit(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await newsAPI.update(editingNews.id, formData);
        setSuccess('News updated successfully!');
      } else {
        await newsAPI.create(formData);
        setSuccess('News created successfully!');
      }
      setShowCreateEdit(false);
      await fetchNews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save news.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news post?')) return;
    try {
      await newsAPI.delete(id);
      setSuccess('News deleted successfully!');
      await fetchNews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete news.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading && news.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Accommodation News</h1>
          <p>Stay updated with announcements from your accommodation provider</p>
        </div>
        {user?.is_staff && (
          <button onClick={handleCreateClick} className="btn btn-primary">
            + Create News
          </button>
        )}
      </div>

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="news-filters">
        <button
          className={`filter-btn ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          All News
        </button>
        {categories.map(cat => (
          <button
            key={cat.value}
            className={`filter-btn ${filter === cat.value ? 'active' : ''}`}
            onClick={() => setFilter(cat.value)}
          >
            {getCategoryIcon(cat.label)} {cat.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {news.length === 0 && !loading ? (
        <div className="empty-state">
          <span className="empty-icon">📰</span>
          <h3>No news available</h3>
          <p>Check back later for updates from your accommodation provider</p>
        </div>
      ) : (
        <div className="news-list">
          {news.filter(post => post.is_pinned).map(post => (
            <div key={post.id} className="news-card pinned">
              <div className="news-header">
                <div className="news-meta">
                  <span className={`category-badge news-${post.category.toLowerCase()}`}>
                    {getCategoryIcon(post.category)} {getCategoryLabel(post.category)}
                  </span>
                  <span className="pinned-badge">📌 Pinned</span>
                </div>
                <span className="news-date">{formatDate(post.published_at)}</span>
              </div>

              <h2 className="news-title">{post.title}</h2>
              <p className="news-content">{post.content}</p>

              <div className="news-footer">
                <span className="news-author">
                  Posted by {post.author.first_name} {post.author.last_name}
                </span>
                <div className="news-footer-right">
                  {post.accommodation_provider && (
                    <span className="provider-tag">{post.accommodation_provider}</span>
                  )}
                  {user?.is_staff && (
                    <div className="news-actions">
                      <button onClick={() => handleEditClick(post)} className="btn-edit" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="btn-delete" title="Delete">
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {news.filter(post => !post.is_pinned).map(post => (
            <div key={post.id} className="news-card">
              <div className="news-header">
                <div className="news-meta">
                  <span className={`category-badge news-${post.category.toLowerCase()}`}>
                    {getCategoryIcon(post.category)} {getCategoryLabel(post.category)}
                  </span>
                </div>
                <span className="news-date">{formatDate(post.published_at)}</span>
              </div>

              <h2 className="news-title">{post.title}</h2>
              <p className="news-content">{post.content}</p>

              <div className="news-footer">
                <span className="news-author">
                  Posted by {post.author.first_name} {post.author.last_name}
                </span>
                <div className="news-footer-right">
                  {post.accommodation_provider && (
                    <span className="provider-tag">{post.accommodation_provider}</span>
                  )}
                  {user?.is_staff && (
                    <div className="news-actions">
                      <button onClick={() => handleEditClick(post)} className="btn-edit" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="btn-delete" title="Delete">
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateEdit && (
        <div className="modal-overlay" onClick={() => setShowCreateEdit(false)}>
          <div className="modal-content news-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingNews ? 'Edit News' : 'Create News'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter news title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content*</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Enter news content"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="accommodation_provider">Accommodation Provider</label>
                  <select
                    id="accommodation_provider"
                    name="accommodation_provider"
                    value={formData.accommodation_provider}
                    onChange={handleInputChange}
                  >
                    <option value="">Select accommodation (optional)</option>
                    {accommodationProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {provider}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_pinned"
                    checked={formData.is_pinned}
                    onChange={handleInputChange}
                  />
                  <span>Pin this news to the top</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateEdit(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingNews ? 'Update News' : 'Create News'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
