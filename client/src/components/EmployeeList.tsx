import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import labels from '../utils/labels';
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
    { 
      field: 'id', 
      headerName: labels.tableHeaders.employee.id, 
      width: 90 
    },
    {
      field: 'name',
      headerName: labels.tableHeaders.employee.name,
      width: 200,
      valueGetter: (params) => `${params.row.firstname} ${params.row.lastname}`
    },
    { 
      field: 'deptname', 
      headerName: labels.tableHeaders.employee.department, 
      width: 200 
    },
    { 
      field: 'title', 
      headerName: labels.tableHeaders.employee.title, 
      width: 200 
    },
    { 
      field: 'typename', 
      headerName: labels.tableHeaders.employee.type, 
      width: 150 
    },
    {
      field: 'status',
      headerName: labels.tableHeaders.employee.status,
      width: 120,
      valueGetter: (params) => 
        params.row.status === '1' 
          ? labels.statusOptions.active.label 
          : labels.statusOptions.inactive.label
    },
    {
      field: 'date_modified',
      headerName: labels.tableHeaders.employee.lastModified,
      width: 200,
      valueGetter: (params) => new Date(params.row.date_modified).toLocaleString()
    }
  ];

  const filteredEmployees = getFilteredEmployees();

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          {labels.dashboard.title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/employees/new')}
        >
          {labels.buttons.save}
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            placeholder={labels.buttons.search}
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
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Filter By</InputLabel>
            <Select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              label="Filter By"
            >
              <MenuItem value="all">All Fields</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="department">Department</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="type">Type</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          disableSelectionOnClick
          loading={loading}
        />
      </div>
    </Paper>
  );
};

export default EmployeeList;
