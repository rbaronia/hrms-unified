import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

const DepartmentDistribution: React.FC = () => {
  const [departments, setDepartments] = useState<{ name: string; value: number; }[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments'); // Adjust this API endpoint accordingly
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching department distribution:', error);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Department Distribution</Typography>
      <List>
        {departments.map(({ name, value }) => (
          <ListItem key={name}>
            <ListItemText primary={name} secondary={`${value} users`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DepartmentDistribution;
