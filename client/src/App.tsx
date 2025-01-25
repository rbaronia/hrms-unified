import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import DepartmentList from './components/DepartmentList';
import UserTypeList from './components/UserTypeList';
import axios from 'axios';

// Add request interceptor
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request.method?.toUpperCase(), request.url);
  return request;
});

// Add response interceptor
axios.interceptors.response.use(
  response => {
    console.log('Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    console.log('Response Data:', response.data);
    return response;
  },
  error => {
    console.error('Response Error:', error.config?.method?.toUpperCase(), error.config?.url);
    console.error('Error Details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/edit/:id" element={<EmployeeForm />} />
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/user-types" element={<UserTypeList />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default App;
