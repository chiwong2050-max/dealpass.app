import axios from 'axios';

// Same-origin by default: the Express server serves both the built frontend and /api in production.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 401 Unauthorized and it's not the login/signup endpoint itself,
    // then it might be an expired or invalid token.
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/')) {
      // You might want to trigger a logout here or redirect to login
      console.warn('Unauthorized API call, token might be expired or invalid. Logging out...');
      localStorage.removeItem('token');
      // Optionally, you could dispatch a global logout action or redirect
      // window.location.href = '/login'; // This would force a full page reload
    }
    return Promise.reject(error);
  }
);

export default api;