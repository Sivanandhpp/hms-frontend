// src/components/common/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css'; // We'll create this

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">HMS</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        {isAuthenticated && user?.roles?.includes("ROLE_ADMIN") && ( // Example: Admin-only link
          <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
        )}
        {isAuthenticated && (user?.roles?.includes("ROLE_RECEPTIONIST") || user?.roles?.includes("ROLE_ADMIN")) && (
          <li><Link to="/patients/new">Add Patient</Link></li>
        )}
        {isAuthenticated && (
          <li><Link to="/patients">Patients</Link></li>
        )}
        {isAuthenticated && (
          <li><Link to="/appointments">Appointments</Link></li>
        )}
        {/* Add more authenticated links as needed */}
      </ul>
      <div className="navbar-auth">
        {isAuthenticated ? (
          <>
            <span className="navbar-username">Welcome, {user?.username || 'User'}!</span>
            <button onClick={handleLogout} className="navbar-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-button">Login</Link>
            <Link to="/register" className="navbar-button navbar-button-outline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;