import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Button, 
  Paper, 
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

interface Employee {
  id: number;
  userid: string;
  firstname: string;
  lastname: string;
  streetaddr: string;
  city: string;
  state: string;
  zipcode: string;
  title: string;
  manager: string;
  ismanager: string;
  edulevel: string;
  status: string;
  deptid: string;
  typeid: string;
  date_modified: string;
  deptname: string;
  typename: string;
  managername: string;
}

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterField, setFilterField] = useState('all');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Employee[]>('/api/employees');
      console.log('Fetched employees:', response.data);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getFilteredEmployees = () => {
    if (!searchText) {
      return employees;
    }

    const searchLower = searchText.toLowerCase();
    return employees.filter(employee => {
      switch (filterField) {
        case 'name':
          return (
            employee.firstname?.toLowerCase().includes(searchLower) ||
            employee.lastname?.toLowerCase().includes(searchLower)
          );
        case 'userid':
          return employee.userid?.toLowerCase().includes(searchLower);
        case 'title':
          return employee.title?.toLowerCase().includes(searchLower);
        case 'department':
          return employee.deptname?.toLowerCase().includes(searchLower);
        case 'all':
        default:
          return (
            employee.firstname?.toLowerCase().includes(searchLower) ||
            employee.lastname?.toLowerCase().includes(searchLower) ||
            employee.userid?.toLowerCase().includes(searchLower) ||
            employee.title?.toLowerCase().includes(searchLower) ||
            employee.deptname?.toLowerCase().includes(searchLower) ||
            employee.typename?.toLowerCase().includes(searchLower)
          );
      }
    });
  };

  const columns: GridColDef[] = [
    { field: 'userid', headerName: 'User ID', width: 130 },
    { field: 'firstname', headerName: 'First Name', width: 130 },
    { field: 'lastname', headerName: 'Last Name', width: 130 },
    { field: 'title', headerName: 'Title', width: 200 },
    { 
      field: 'deptname', 
      headerName: 'Department', 
      width: 400,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'pre',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          {params.value}
        </div>
      )
    },
    { field: 'typename', headerName: 'User Type', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/employees/edit/${params.row.id}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  const filteredEmployees = getFilteredEmployees();

  return (
    <Paper elevation={3} sx={{ p: 3, m: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Employee List
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search employees..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Search In</InputLabel>
              <Select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                label="Search In"
              >
                <MenuItem value="all">All Fields</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="userid">User ID</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="department">Department</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/employees/new')}
            >
              Add Employee
            </Button>
          </Grid>
        </Grid>
      </Box>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
          loading={loading}
        />
      </div>
    </Paper>
  );
};

export default EmployeeList;
