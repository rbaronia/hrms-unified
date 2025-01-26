import React, { useEffect, useState } from 'react';
import labels from '../utils/labels';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
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
import axios from 'axios';

interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  deptname: string;
  usertype: string;
  date_modified: string;
}

interface DashboardData {
  totalEmployees: number;
  departmentDistribution: { name: string; value: number; }[];
  userTypeDistribution: { name: string; value: number; }[];
  recentHires: Employee[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    totalEmployees: 0,
    departmentDistribution: [],
    userTypeDistribution: [],
    recentHires: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/employees');
        const employees: Employee[] = response.data;

        // Calculate department distribution
        const deptCount = employees.reduce((acc, emp) => {
          const deptName = emp.deptname || 'Unassigned';
          acc[deptName] = (acc[deptName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const departmentDistribution = Object.entries(deptCount).map(([name, value]) => ({
          name,
          value,
        }));

        // Calculate user type distribution
        const typeCount = employees.reduce((acc, emp) => {
          const userType = emp.usertype || 'Unassigned';
          acc[userType] = (acc[userType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const userTypeDistribution = Object.entries(typeCount).map(([name, value]) => ({
          name,
          value,
        }));

        // Get recent hires (last 5)
        const recentHires = [...employees]
          .sort((a, b) => new Date(b.date_modified).getTime() - new Date(a.date_modified).getTime())
          .slice(0, 5);

        setData({
          totalEmployees: employees.length,
          departmentDistribution,
          userTypeDistribution,
          recentHires,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          {labels.dashboard.title}
        </Typography>
      </Grid>

      {/* Total Employees Card */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {labels.dashboard.totalEmployees}
          </Typography>
          <Typography variant="h3">
            {data.totalEmployees}
          </Typography>
        </Paper>
      </Grid>

      {/* Department Distribution */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
          <Typography variant="h6" gutterBottom>
            {labels.dashboard.departmentDistribution}
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.departmentDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* User Type Distribution */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
          <Typography variant="h6" gutterBottom>
            {labels.dashboard.userTypeDistribution}
          </Typography>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.userTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Recent Hires */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {labels.dashboard.recentHires}
          </Typography>
          <List>
            {data.recentHires.map((employee) => (
              <ListItem key={employee.id}>
                <ListItemText
                  primary={`${employee.firstname} ${employee.lastname}`}
                  secondary={`${employee.deptname} - ${new Date(employee.date_modified).toLocaleDateString()}`}
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
