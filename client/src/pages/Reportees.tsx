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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportees = async () => {
      try {
        console.log('Fetching reportees...');
        const response = await api.api.get('/api/reportees');
        console.log('Reportees response:', response.data);
        
        if (Array.isArray(response.data)) {
          setReportees(response.data);
          setError(null);
        } else {
          console.error('Unexpected API response format:', response.data);
          setReportees([]);
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching reportees:', error);
        setReportees([]);
        setError('Failed to load reportees');
      }
    };

    fetchReportees();
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
      <Typography variant="h4" gutterBottom>Reportees</Typography>
      {reportees.length === 0 ? (
        <Typography>No reportees found</Typography>
      ) : (
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
      )}
    </Paper>
  );
};

export default Reportees;
