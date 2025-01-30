import axiosInstance from '../api/axiosConfig';

// API endpoints
const endpoints = {
  dashboard: {
    getData: () => axiosInstance.get('/dashboard')
  },
  users: {
    getAll: () => axiosInstance.get('/users'),
    getById: (id: number) => axiosInstance.get(`/users/${id}`),
    create: (data: any) => axiosInstance.post('/users', data),
    update: (id: number, data: any) => axiosInstance.put(`/users/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/users/${id}`),
    getManagers: () => axiosInstance.get('/users/managers'),
    generateUserId: (firstName: string, lastName: string) =>
      axiosInstance.get(`/users/generate-userid?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`)
  },
  departments: {
    getAll: () => axiosInstance.get('/departments'),
    getById: (id: number) => axiosInstance.get(`/departments/${id}`),
    create: (data: any) => axiosInstance.post('/departments', data),
    update: (id: number, data: any) => axiosInstance.put(`/departments/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/departments/${id}`)
  },
  userTypes: {
    getAll: () => axiosInstance.get('/userTypes'),
    getById: (id: number) => axiosInstance.get(`/userTypes/${id}`),
    create: (data: any) => axiosInstance.post('/userTypes', data),
    update: (id: number, data: any) => axiosInstance.put(`/userTypes/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/userTypes/${id}`)
  },
  reportees: {
    getAll: () => axiosInstance.get('/reportees')
  }
};

export default { api: axiosInstance, endpoints };
