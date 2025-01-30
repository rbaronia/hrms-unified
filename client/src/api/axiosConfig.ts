import axios from 'axios';

// Get the current hostname and port
const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  // If running in development with different ports for client and server
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:3000';
  }
  // In production, use the same origin
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

// Create axios instance with dynamic base URL
const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
