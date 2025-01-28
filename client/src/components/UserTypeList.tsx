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
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import labels from '../utils/labels';

interface UserType {
  typeid: number;
  typename: string;
}

const UserTypeList: React.FC = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    typename: '',
  });

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    try {
      const response = await axios.get('/api/userTypes');
      setUserTypes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user types:', error);
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setFormData({ typename: '' });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUserType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && selectedUserType) {
        await axios.put(`/api/userTypes/${selectedUserType.typeid}`, formData);
      } else {
        await axios.post('/api/userTypes', formData);
      }
      fetchUserTypes();
      handleClose();
    } catch (error) {
      console.error('Error saving user type:', error);
    }
  };

  const handleEdit = (userType: UserType) => {
    setSelectedUserType(userType);
    setFormData({ typename: userType.typename });
    setEditMode(true);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/userTypes/${id}`);
      fetchUserTypes();
    } catch (error) {
      console.error('Error deleting user type:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">{labels.userType.title}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          {labels.userType.add}
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{labels.userType.id}</TableCell>
              <TableCell>{labels.userType.name}</TableCell>
              <TableCell align="right">{labels.tableHeaders.user.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userTypes.map((userType) => (
              <TableRow key={userType.typeid}>
                <TableCell>{userType.typeid}</TableCell>
                <TableCell>{userType.typename}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(userType)}
                    >
                      {labels.userType.edit}
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => handleDelete(userType.typeid)}
                    >
                      {labels.userType.delete}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editMode ? labels.userType.edit : labels.userType.add}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={labels.userType.name}
              fullWidth
              value={formData.typename}
              onChange={(e) => setFormData({ ...formData, typename: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{labels.buttons.cancel}</Button>
            <Button type="submit" variant="contained" color="primary">
              {editMode ? labels.buttons.update : labels.buttons.save}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default UserTypeList;
