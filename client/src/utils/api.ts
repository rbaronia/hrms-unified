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

const API_PREFIX = '/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${getBaseUrl()}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
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

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      error: error.response?.data || error.message
    });
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  dashboard: {
    getData: () => api.get('/dashboard')
  },
  users: {
    getAll: () => api.get('/users'),
    getById: (id: number) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/users', data),
    update: (id: number, data: any) => api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
    getManagers: () => api.get('/users/managers'),
    generateUserId: (firstName: string, lastName: string) => 
      api.get(`/users/generate-userid?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`)
  },
  departments: {
    getAll: () => api.get('/departments'),
    getById: (id: number) => api.get(`/departments/${id}`),
    create: (data: any) => api.post('/departments', data),
    update: (id: number, data: any) => api.put(`/departments/${id}`, data),
    delete: (id: number) => api.delete(`/departments/${id}`)
  },
  userTypes: {
    getAll: () => api.get('/userTypes'),
    getById: (id: number) => api.get(`/userTypes/${id}`),
    create: (data: any) => api.post('/userTypes', data),
    update: (id: number, data: any) => api.put(`/userTypes/${id}`, data),
    delete: (id: number) => api.delete(`/userTypes/${id}`)
  }
};

export default { api, endpoints };
