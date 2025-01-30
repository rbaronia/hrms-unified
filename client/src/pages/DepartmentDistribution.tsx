import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

interface Department {
  deptid: number;
  deptname: string;
  parentid: number | null;
}

const DepartmentDistribution: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.api.get('api/departments');
        if (Array.isArray(response.data)) {
          setDepartments(response.data);
        } else {
          console.error('Unexpected API response format:', response.data);
          setDepartments([]);
        }
      } catch (error) {
        console.error('Error fetching department distribution:', error);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Department Distribution</Typography>
      <List>
        {departments.map((dept) => (
          <ListItem key={dept.deptid}>
            <ListItemText 
              primary={dept.deptname} 
              secondary={dept.parentid ? `Parent ID: ${dept.parentid}` : 'Root Department'} 
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DepartmentDistribution;
