// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/api'; // Our configured Axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user object { username, roles }
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [loading, setLoading] = useState(true); // To handle initial auth check

  useEffect(() => {
    // Check for existing token and user info on initial load
    const storedToken = localStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
        // Clear invalid stored user
        localStorage.removeItem('user');
        localStorage.removeItem('jwtToken');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false); // Finished initial check
  }, []);


  const login = async (usernameOrEmail, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        usernameOrEmail,
        password,
      });
      const { accessToken, username, roles } = response.data;
      localStorage.setItem('jwtToken', accessToken);
      const userData = { username, roles };
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response && error.response.data) {
        // Assuming backend sends a message field for errors
        errorMessage = error.response.data.message || (typeof error.response.data === 'string' ? error.response.data : errorMessage);
      }
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => { // userData = { fullName, username, email, password, roles (optional) }
    try {
        const response = await apiClient.post('/auth/register', userData);
        return { success: true, message: response.data }; // Assuming backend sends a success message string
    } catch (error) {
        console.error('Registration failed:', error.response?.data || error.message);
        let errorMessage = "Registration failed. Please try again.";
         if (error.response && error.response.data) {
            if (typeof error.response.data === 'object' && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (typeof error.response.data === 'object') { // Handle validation errors object
                const validationErrors = Object.values(error.response.data).join(', ');
                errorMessage = validationErrors || errorMessage;
            }
        }
        return { success: false, message: errorMessage };
    }
  };


  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Optionally: make a call to a backend /logout endpoint if you have one
    // to invalidate the token on the server-side (if your backend supports it)
  };

  // isAuthenticated can be derived from the user state
  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    register, // Add register to context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};