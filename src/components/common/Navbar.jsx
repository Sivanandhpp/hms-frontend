// src/components/common/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false); // Close menu on logout
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Helper to check if user has ANY of the provided roles
  const hasAnyRole = (rolesToCheck) => {
    if (!user || !user.roles) return false;
    return rolesToCheck.some(role => user.roles.includes(role));
  };

  // Define roles for clarity
  const canViewPatients = hasAnyRole(["ROLE_ADMIN", "ROLE_RECEPTIONIST", "ROLE_DOCTOR", "ROLE_NURSE"]);
  const canAddPatients = hasAnyRole(["ROLE_ADMIN", "ROLE_RECEPTIONIST"]);
  const canViewAppointments = hasAnyRole(["ROLE_ADMIN", "ROLE_RECEPTIONIST", "ROLE_DOCTOR", "ROLE_NURSE"]);
  const isAdmin = hasAnyRole(["ROLE_ADMIN"]);


  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">HMS</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        {isAuthenticated && canViewPatients && (
          <li><Link to="/patients">Patients</Link></li>
        )}
        {isAuthenticated && canAddPatients && (
            <li><Link to="/patients/new">Add Patient</Link></li>
        )}
        {isAuthenticated && canViewAppointments && (
          <li><Link to="/appointments">Appointments</Link></li>
        )}
         {isAuthenticated && isAdmin && (
          <li><Link to="/admin/dashboard">Admin</Link></li>
        )}
      </ul>
      <div className="navbar-auth">
        {isAuthenticated && user ? (
          <div className="user-menu-container">
            <button onClick={toggleUserMenu} className="navbar-username-button">
              {user.username} <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
            </button>
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <Link to="/profile" onClick={() => setShowUserMenu(false)}>My Profile</Link> {/* Placeholder route */}
                <button onClick={handleLogout} className="dropdown-logout-button">Logout</button>
              </div>
            )}
          </div>
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