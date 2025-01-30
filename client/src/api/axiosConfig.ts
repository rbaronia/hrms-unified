import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  // Use root path since we're adding /api in each request
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication and dynamic base URL
axiosInstance.interceptors.request.use(
  (config) => {
    // Don't set baseURL here since we're using absolute paths with /api prefix
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
