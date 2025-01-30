import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authentication token if available
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
