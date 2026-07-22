import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    interests: user?.interests || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile(formData);
      updateUserProfile(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
      interests: user?.interests || ''
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <div className="page-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary">
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="profile-basic-info">
              <h2>{user?.first_name} {user?.last_name}</h2>
              <p className="profile-email">{user?.email}</p>
              {user?.email_verified ? (
                <span className="verified-badge">✓ Verified</span>
              ) : (
                <span className="unverified-badge">⚠ Not Verified</span>
              )}
            </div>
          </div>

          <div className="profile-details">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="interests">Interests</label>
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g., sports, music, gaming (comma-separated)"
                  />
                  <span className="form-hint">Separate multiple interests with commas</span>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCancel} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info-display">
                <div className="info-section">
                  <h3>University Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">University</span>
                      <span className="info-value">{user?.university || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Accommodation</span>
                      <span className="info-value">{user?.accommodation_provider || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>About Me</h3>
                  <p className="bio-text">{user?.bio || 'No bio added yet.'}</p>
                </div>

                {user?.interests && (
                  <div className="info-section">
                    <h3>Interests</h3>
                    <div className="interests-list">
                      {user.interests.split(',').map((interest, index) => (
                        <span key={index} className="interest-tag">
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="info-section">
                  <h3>Account Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Member Since</span>
                      <span className="info-value">
                        {new Date(user?.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
