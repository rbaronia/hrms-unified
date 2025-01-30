import axios from 'axios';

// Get the current hostname and port
const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  // Always use the same origin to ensure server-relative URLs
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

// Create axios instance with dynamic base URL
const axiosInstance = axios.create({
  baseURL: `${getBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
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

export default axiosInstance;
