// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Props:
// - allowedRoles: an array of role strings (e.g., ["ROLE_ADMIN", "ROLE_DOCTOR"])
//                 If not provided, just checks for authentication.
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading spinner or a blank page while auth state is being determined
    return <div>Loading authentication status...</div>; // Or a proper loading component
  }

  if (!isAuthenticated) {
    // User not logged in, redirect them to the login page.
    // Pass the current location so we can send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, now check roles if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = user?.roles?.some(role => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      // User does not have the required role, redirect to an unauthorized page or home
      // For simplicity, redirecting to home. You might want a dedicated "Unauthorized" page.
      console.warn(`User ${user?.username} does not have required roles: ${allowedRoles.join(', ')} for path ${location.pathname}`);
      return <Navigate to="/" state={{ from: location }} replace />; // Or to an "/unauthorized" page
    }
  }

  // User is authenticated and (if roles were specified) has the required role(s)
  return <Outlet />; // Render the child route (the actual page component)
};

export default ProtectedRoute;