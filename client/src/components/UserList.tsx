import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { User } from '../types/user';
import labels from '../utils/labels';
import api from '../utils/api';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.api.get<User[]>('/api/users');
      if (Array.isArray(response.data)) {
        const processedUsers = response.data.map((user: User) => ({
          ...user,
          id: user.id,
          name: `${user.firstname} ${user.lastname}`,
          department: user.deptname,
          type: user.typename,
          lastModified: new Date(user.date_modified).toLocaleString()
        }));
        setUsers(processedUsers);
        setFilteredUsers(processedUsers);
      } else {
        console.error('Unexpected users API response:', response.data);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = users.filter(user => {
        const searchableFields = [
          user.name || '',
          user.department || '',
          user.title || '',
          user.type || ''
        ];
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchTermLower)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleDelete = async (id: string) => {
    if (window.confirm(labels.messages.confirmDelete)) {
      try {
        await api.api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: labels.user.id, width: 100 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'department', headerName: labels.user.department, width: 150 },
    { field: 'title', headerName: labels.user.position, width: 150 },
    { field: 'type', headerName: labels.user.userType, width: 150 },
    { field: 'lastModified', headerName: 'Last Modified', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate(`/users/${params.row.id}/edit`)}
            sx={{ mr: 1 }}
          >
            {labels.buttons.edit}
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            {labels.buttons.delete}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {labels.user.title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/users/new')}
        >
          {labels.buttons.addUser}
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, department, title, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </div>
    </Paper>
  );
};

export default UserList;
