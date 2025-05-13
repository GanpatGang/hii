import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">Education Platform</Link>
      </div>

      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-item">
          Dashboard
        </Link>
        <Link to="/materials" className="navbar-item">
          Materials
        </Link>
        {user.role === 'admin' && (
          <Link to="/users" className="navbar-item">
            Users
          </Link>
        )}
      </div>

      <div className="navbar-end">
        <div className="user-info">
          <span className="user-name">{user.fullName}</span>
          <span className="user-role">{user.role}</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar; 