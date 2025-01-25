import React, { useEffect, useState } from 'react';
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
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Total Employees: {data.totalEmployees}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
          <Typography variant="h6" gutterBottom>
            Department Distribution
          </Typography>
          <ResponsiveContainer>
            <BarChart data={data.departmentDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
          <Typography variant="h6" gutterBottom>
            User Type Distribution
          </Typography>
          <ResponsiveContainer>
            <BarChart data={data.userTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Recent Hires
          </Typography>
          <List>
            {data.recentHires.map((employee) => (
              <ListItem key={employee.id}>
                <ListItemText
                  primary={`${employee.firstname} ${employee.lastname}`}
                  secondary={`Department: ${employee.deptname || 'Unassigned'} | User Type: ${employee.usertype || 'Unassigned'}`}
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
