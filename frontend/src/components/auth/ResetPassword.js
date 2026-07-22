import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrors({ general: 'Invalid or missing reset token' });
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrors({ general: 'Invalid reset token' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await api.post('/auth/password-reset-confirm/', {
        token: token,
        password: formData.password,
        password2: formData.password2,
      });

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setLoading(false);

      if (err.response && err.response.data) {
        const errorData = err.response.data;

        if (errorData.error) {
          setErrors({ general: errorData.error });
        } else if (errorData.token) {
          setErrors({ general: errorData.token[0] || 'Invalid or expired token' });
        } else if (errorData.password) {
          setErrors({ password: errorData.password[0] });
        } else if (errorData.password2) {
          setErrors({ password2: errorData.password2[0] });
        } else {
          setErrors({ general: 'Failed to reset password. Please try again.' });
        }
      } else {
        setErrors({ general: 'Network error. Please try again later.' });
      }
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">✓</div>
            <h1>Password Reset Successful!</h1>
            <p>Your password has been changed</p>
          </div>

          <div className="success-message">
            <p>Your password has been reset successfully.</p>
            <p>You can now log in with your new password.</p>
          </div>

          <div className="info-box">
            <p>Redirecting to login page in 3 seconds...</p>
          </div>

          <Link to="/login" className="btn btn-primary btn-block">
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Your Password</h1>
          <p>Enter your new password</p>
        </div>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password (min. 8 characters)"
              className={errors.password ? 'error' : ''}
              disabled={loading || !token}
              autoFocus
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
            <small className="form-hint">
              Password must be at least 8 characters long and contain letters and numbers
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password2">Confirm New Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className={errors.password2 ? 'error' : ''}
              disabled={loading || !token}
            />
            {errors.password2 && <span className="error-text">{errors.password2}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !token}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
