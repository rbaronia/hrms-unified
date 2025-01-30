import axiosInstance from '../api/axiosConfig';

// API endpoints
const endpoints = {
  dashboard: {
    getData: () => axiosInstance.get('/api/dashboard')
  },
  users: {
    getAll: () => axiosInstance.get('/api/users'),
    getById: (id: number) => axiosInstance.get(`/api/users/${id}`),
    create: (data: any) => axiosInstance.post('/api/users', data),
    update: (id: number, data: any) => axiosInstance.put(`/api/users/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/api/users/${id}`),
    getManagers: () => axiosInstance.get('/api/users/managers'),
    generateUserId: (firstName: string, lastName: string) =>
      axiosInstance.get(`/api/users/generate-userid?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`)
  },
  departments: {
    getAll: () => axiosInstance.get('/api/departments'),
    getById: (id: number) => axiosInstance.get(`/api/departments/${id}`),
    create: (data: any) => axiosInstance.post('/api/departments', data),
    update: (id: number, data: any) => axiosInstance.put(`/api/departments/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/api/departments/${id}`)
  },
  userTypes: {
    getAll: () => axiosInstance.get('/api/userTypes'),
    getById: (id: number) => axiosInstance.get(`/api/userTypes/${id}`),
    create: (data: any) => axiosInstance.post('/api/userTypes', data),
    update: (id: number, data: any) => axiosInstance.put(`/api/userTypes/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/api/userTypes/${id}`)
  },
  reportees: {
    getAll: () => axiosInstance.get('/api/reportees')
  }
};

export default { api: axiosInstance, endpoints };
