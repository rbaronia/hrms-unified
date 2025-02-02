import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

interface Department {
  deptid: number;
  deptname: string;
  parentid: number | null;
  userCount: number;
}

const DepartmentDistribution: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        console.log('Fetching departments...');
        const response = await api.api.get('/api/departments');
        console.log('Departments response:', response.data);
        
        if (Array.isArray(response.data)) {
          setDepartments(response.data);
          setError(null);
        } else {
          console.error('Unexpected API response format:', response.data);
          setDepartments([]);
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching department distribution:', error);
        setDepartments([]);
        setError('Failed to load departments');
      }
    };

    fetchDepartments();
  }, []);

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, backgroundColor: '#fff3f3' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Department Distribution</Typography>
      {departments.length === 0 ? (
        <Typography>No departments found</Typography>
      ) : (
        <List>
          {departments.map((dept) => (
            <ListItem key={dept.deptid}>
              <ListItemText 
                primary={dept.deptname} 
                secondary={`${dept.userCount} users${dept.parentid ? ` • Parent ID: ${dept.parentid}` : ' • Root Department'}`} 
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default DepartmentDistribution;
