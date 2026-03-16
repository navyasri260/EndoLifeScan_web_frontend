import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Activity, LogOut, Settings, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Activity className="brand-icon" size={28} />
          <span className="brand-text">EndoLifeScan</span>
        </Link>

        <div className="navbar-menu">
          <div className="user-profile">
            <div className="avatar">
              <User size={18} />
            </div>
            <span className="user-name">{user.full_name}</span>
          </div>
          
          <Link to="/settings" className="nav-icon-link" title="Settings">
            <Settings size={20} />
          </Link>
          
          <button onClick={handleLogout} className="nav-icon-link logout-btn" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
