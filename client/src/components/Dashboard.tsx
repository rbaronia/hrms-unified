import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';

interface User {
  id: number;
  userid: string;
  firstname: string;
  lastname: string;
  department: string;
  status: string;
  date_modified: string;
  time_ago: string;
  manager: string | null;
  managername: string | null;
}

interface DashboardData {
  userStatusCounts: {
    total: number;
    active: number;
    disabled: number;
    terminated: number;
    recentlyUpdated: number;
  };
  departmentDistribution: Array<{ name: string; value: number }>;
  userTypeDistribution: Array<{ name: string; value: number }>;
  managerDistribution: Array<{ name: string; value: number; userid: string }>;
  recentUpdates: User[];
}

// Custom colors for different charts
const chartColors = {
  department: '#2196F3',
  userType: '#4CAF50',
  manager: '#FFC107'
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    userStatusCounts: {
      total: 0,
      active: 0,
      disabled: 0,
      terminated: 0,
      recentlyUpdated: 0
    },
    departmentDistribution: [],
    userTypeDistribution: [],
    managerDistribution: [],
    recentUpdates: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.api.get('/api/dashboard');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const getStatusColor = (status: 'active' | 'disabled' | 'terminated') => {
    switch (status) {
      case 'active':
        return '#4CAF50'; // Green for active
      case 'disabled':
        return '#FFC107'; // Orange for disabled
      case 'terminated':
        return '#F44336'; // Red for terminated
      default:
        return '#757575'; // Gray for unknown
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Status Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Users</Typography>
                <Typography variant="h4">{data.userStatusCounts.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Active Users</Typography>
                <Typography variant="h4" sx={{ color: getStatusColor('active') }}>
                  {data.userStatusCounts.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Disabled Users</Typography>
                <Typography variant="h4" sx={{ color: getStatusColor('disabled') }}>
                  {data.userStatusCounts.disabled}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Terminated Users</Typography>
                <Typography variant="h4" sx={{ color: getStatusColor('terminated') }}>
                  {data.userStatusCounts.terminated}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Updated (24h)</Typography>
                <Typography variant="h4" sx={{ color: 'primary.main' }}>
                  {data.userStatusCounts.recentlyUpdated}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '400px' }}>
          <Typography variant="h6" gutterBottom>User Type Distribution</Typography>
          <ResponsiveContainer>
            <BarChart data={data.userTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={chartColors.userType} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '400px' }}>
          <Typography variant="h6" gutterBottom>Department Distribution</Typography>
          <ResponsiveContainer>
            <BarChart data={data.departmentDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={chartColors.department} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '400px' }}>
          <Typography variant="h6" gutterBottom>Team Size by Manager</Typography>
          <ResponsiveContainer>
            <BarChart data={data.managerDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                label={{ 
                  value: 'Number of Direct Reports', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Direct Reports"
                fill={chartColors.manager}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Recent Updates */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Recent Updates</Typography>
          <List>
            {data.recentUpdates.map((update) => (
              <ListItem key={update.id}>
                <ListItemText
                  primary={`${update.firstname} ${update.lastname}`}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {update.department}
                      </Typography>
                      {update.managername && (
                        <>
                          {' • Manager: '}
                          <Typography component="span" variant="body2" color="text.primary">
                            {update.managername}
                          </Typography>
                        </>
                      )}
                      {' • '}
                      {update.time_ago}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
