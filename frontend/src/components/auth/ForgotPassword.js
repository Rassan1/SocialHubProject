import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/password-reset/', { email });

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('An error occurred. Please try again later.');
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">✓</div>
            <h1>Check Your Email</h1>
            <p>Password reset link sent successfully</p>
          </div>

          <div className="success-message">
            <p>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p>
              Please check your inbox and click the link to reset your password.
              The link will expire in 24 hours.
            </p>
          </div>

          <div className="info-box">
            <p><strong>Didn't receive the email?</strong></p>
            <ul>
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and check again</li>
            </ul>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="btn btn-secondary btn-block"
              style={{ marginTop: '15px' }}
            >
              Try Another Email
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Remember your password? <Link to="/login">Back to login</Link>
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
          <h1>Forgot Password?</h1>
          <p>Enter your email to reset your password</p>
        </div>

        {error && (
          <div className="error-message general-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="your.email@example.com"
              className={error ? 'error' : ''}
              disabled={loading}
              autoFocus
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Back to login</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
