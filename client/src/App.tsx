import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import DepartmentList from './components/DepartmentList';
import UserTypes from './components/UserTypes';
import Admin from './pages/Admin';
import AdminPanel from './components/AdminPanel';
import { LabelProvider } from './context/LabelContext';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LabelProvider>
        <Box sx={{ display: 'flex' }}>
          <Navigation />
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <Container maxWidth="lg">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/users/new" element={<UserForm />} />
                <Route path="/users/:id/edit" element={<UserForm />} />
                <Route path="/departments" element={<DepartmentList />} />
                <Route path="/user-types" element={<UserTypes />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/panel" element={<AdminPanel />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </LabelProvider>
    </ThemeProvider>
  );
};

export default App;
