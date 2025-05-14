// src/services/api.js
import axios from 'axios';

// The base URL for your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api/v1'; // Make sure this matches your backend port

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the JWT token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken'); // We'll store the token in localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// You can also add response interceptors, e.g., to handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - 401. Redirecting to login might be needed.");
      // localStorage.removeItem('jwtToken');
      // localStorage.removeItem('user'); // We'll store user info too
      // window.location.href = '/login'; // Or use React Router's navigate
    }
    return Promise.reject(error);
  }
);


export default apiClient;