import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

interface Reportee {
  userid: string;
  firstname: string;
  lastname: string;
  manager: string | null;
}

const Reportees: React.FC = () => {
  const [reportees, setReportees] = useState<Reportee[]>([]);

  useEffect(() => {
    const fetchReportees = async () => {
      try {
        const response = await api.api.get('/api/reportees');
        if (Array.isArray(response.data)) {
          setReportees(response.data);
        } else {
          console.error('Unexpected API response format:', response.data);
          setReportees([]);
        }
      } catch (error) {
        console.error('Error fetching reportees:', error);
        setReportees([]);
      }
    };

    fetchReportees();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reportees</Typography>
      <List>
        {reportees.map((reportee) => (
          <ListItem key={reportee.userid}>
            <ListItemText 
              primary={`${reportee.firstname} ${reportee.lastname}`} 
              secondary={reportee.manager ? `Manager: ${reportee.manager}` : 'No Manager'} 
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Reportees;
