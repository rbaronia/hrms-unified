import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  // Always use a relative path for the API
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication and dynamic base URL
axiosInstance.interceptors.request.use(
  (config) => {
    // Always use a relative path for the API
    config.baseURL = '/api';
    
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

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Log the error for debugging
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
