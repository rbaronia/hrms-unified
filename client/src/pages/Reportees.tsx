import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

const Reportees: React.FC = () => {
  const [reportees, setReportees] = useState<{ manager: string; count: number; }[]>([]);

  useEffect(() => {
    const fetchReportees = async () => {
      try {
        const response = await api.api.get('api/reportees');
        setReportees(response.data);
      } catch (error) {
        console.error('Error fetching reportees:', error);
      }
    };

    fetchReportees();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reportees</Typography>
      <List>
        {reportees.map(({ manager, count }) => (
          <ListItem key={manager}>
            <ListItemText primary={manager} secondary={`${count} reportees`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Reportees;
