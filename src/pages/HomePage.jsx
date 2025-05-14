// src/pages/HomePage.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <h1>Welcome to the Hospital Management System</h1>
      {isAuthenticated ? (
        <p>You are logged in as: {user?.username} (Roles: {user?.roles?.join(', ')})</p>
      ) : (
        <p>Please log in or register to continue.</p>
      )}
      <p>This is the main landing page of the application.</p>
      {/* You can add more content or links here */}
    </div>
  );
}

export default HomePage;