import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface UserType {
  typeid: number;
  typename: string;
}

const UserTypeList: React.FC = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUserType, setEditingUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    typeid: '',
    typename: '',
  });

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    try {
      const response = await axios.get('/api/employees/userTypes');
      setUserTypes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user types:', error);
      setLoading(false);
    }
  };

  const handleOpenDialog = (userType?: UserType) => {
    if (userType) {
      setEditingUserType(userType);
      setFormData({
        typeid: userType.typeid.toString(),
        typename: userType.typename,
      });
    } else {
      setEditingUserType(null);
      setFormData({
        typeid: '',
        typename: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUserType(null);
    setFormData({
      typeid: '',
      typename: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUserType) {
        await axios.put(`/api/employees/userTypes/${editingUserType.typeid}`, {
          typename: formData.typename,
        });
      } else {
        await axios.post('/api/employees/userTypes', {
          typeid: parseInt(formData.typeid),
          typename: formData.typename,
        });
      }
      handleCloseDialog();
      fetchUserTypes();
    } catch (error) {
      console.error('Error saving user type:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user type?')) {
      try {
        await axios.delete(`/api/employees/userTypes/${id}`);
        fetchUserTypes();
      } catch (error) {
        console.error('Error deleting user type:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'typeid', headerName: 'ID', width: 100 },
    { field: 'typename', headerName: 'Type Name', width: 300 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleOpenDialog(params.row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => handleDelete(params.row.typeid)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2">
          User Types
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User Type
        </Button>
      </Box>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={userTypes}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.typeid}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingUserType ? 'Edit User Type' : 'Add New User Type'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {!editingUserType && (
              <TextField
                fullWidth
                label="Type ID"
                name="typeid"
                type="number"
                value={formData.typeid}
                onChange={(e) => setFormData({ ...formData, typeid: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              label="Type Name"
              name="typename"
              value={formData.typename}
              onChange={(e) => setFormData({ ...formData, typename: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default UserTypeList;
