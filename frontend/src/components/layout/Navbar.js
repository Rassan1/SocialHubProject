import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-text">The Social Hub</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/events" className={`nav-link ${isActive('/events')}`}>
            Events
          </Link>
          <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>
            Chat
          </Link>
          <Link to="/news" className={`nav-link ${isActive('/news')}`}>
            News
          </Link>
          <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
            Profile
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.first_name} {user?.last_name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout-nav">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
