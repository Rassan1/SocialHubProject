import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, isAuthenticated } = useAuth();

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your email link.');
      return;
    }

    if (hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    const verify = async () => {
      setStatus('verifying');
      setMessage('Verifying your email address...');

      try {
        const result = await verifyEmail(token);

        if (result && result.success) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to home page...');

          // Start countdown
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                navigate('/');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setStatus('error');
          const errorData = result?.error || {};

          if (errorData.error) {
            setMessage(errorData.error);
          } else if (errorData.detail) {
            setMessage(errorData.detail);
          } else if (errorData.token) {
            setMessage(Array.isArray(errorData.token) ? errorData.token[0] : errorData.token);
          } else if (errorData.message) {
            setMessage(errorData.message);
          } else {
            setMessage('Email verification failed. The token may be invalid or expired.');
          }
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    verify();
  }, [searchParams, verifyEmail, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Email Verification</h1>
        </div>

        <div className={`verification-status ${status}`}>
          {status === 'verifying' && (
            <div className="status-content">
              <div className="spinner"></div>
              <p>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="status-content success">
              <div className="success-icon">✓</div>
              <h2>Verification Successful!</h2>
              <p>{message}</p>
              <p className="countdown">Redirecting in {countdown} seconds...</p>
              <button onClick={() => navigate('/')} className="btn btn-primary">
                Go to Home Now
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="status-content error">
              <div className="error-icon">✕</div>
              <h2>Verification Failed</h2>
              <p className="error-message">{message}</p>
              <div className="error-actions">
                <Link to="/register" className="btn btn-secondary">
                  Register Again
                </Link>
                <Link to="/login" className="btn btn-primary">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="auth-footer">
          <p>
            Need help? <a href="mailto:support@socialhub.com">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
