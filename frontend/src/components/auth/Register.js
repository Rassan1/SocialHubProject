import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    university: '',
    accommodation_provider: '',
    interests: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const accommodationProviders = [
    'Scape',
    'Unite Students',
    'IQ Student Accommodation',
    'Fresh Student Living',
    'CRM Students',
    'Vita Student',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Password confirmation
    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    // Required fields
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.university) newErrors.university = 'University is required';
    if (!formData.accommodation_provider) {
      newErrors.accommodation_provider = 'Accommodation provider is required';
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
    setErrors({});

    const result = await register(formData);

    setLoading(false);

    if (result.success) {
      setShowVerification(true);
    } else {
      if (result.error.field_errors) {
        setErrors(result.error.field_errors);
      } else if (result.error.error) {
        setErrors({ general: result.error.error });
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    }
  };

  if (showVerification) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>We've sent a verification link to {formData.email}</p>
          </div>

          <div className="verification-message">
            <div className="success-icon">✓</div>
            <p>Please check your email and click the verification link to complete your registration.</p>
            <p>The verification link will expire in 24 hours.</p>
          </div>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join The Social Hub and connect with students across accommodations</p>
        </div>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'error' : ''}
                disabled={loading}
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'error' : ''}
                disabled={loading}
              />
              {errors.last_name && <span className="error-text">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">University Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.name@university.ac.uk"
              className={errors.email ? 'error' : ''}
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="university">University *</label>
            <input
              type="text"
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="e.g., University of Surrey"
              className={errors.university ? 'error' : ''}
              disabled={loading}
            />
            {errors.university && <span className="error-text">{errors.university}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="accommodation_provider">Accommodation Provider *</label>
            <select
              id="accommodation_provider"
              name="accommodation_provider"
              value={formData.accommodation_provider}
              onChange={handleChange}
              className={errors.accommodation_provider ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Select your accommodation</option>
              {accommodationProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
            {errors.accommodation_provider && (
              <span className="error-text">{errors.accommodation_provider}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password2">Confirm Password *</label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={errors.password2 ? 'error' : ''}
                disabled={loading}
              />
              {errors.password2 && <span className="error-text">{errors.password2}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="interests">Interests (Optional)</label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g., sports, music, gaming, study groups"
              disabled={loading}
            />
            <small className="form-hint">Separate interests with commas</small>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
