import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import labels from '../utils/labels';
import { UserType } from '../types/user';

const UserTypes: React.FC = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [open, setOpen] = useState(false);
  const [editingType, setEditingType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    typeid: '',
    typename: ''
  });

  const fetchUserTypes = async () => {
    try {
      const response = await axios.get('/api/userTypes');
      setUserTypes(response.data);
    } catch (error) {
      console.error('Error fetching user types:', error);
    }
  };

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const handleOpen = (userType?: UserType) => {
    if (userType) {
      setEditingType(userType);
      setFormData({
        typeid: userType.typeid.toString(),
        typename: userType.typename
      });
    } else {
      setEditingType(null);
      setFormData({
        typeid: '',
        typename: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingType(null);
    setFormData({
      typeid: '',
      typename: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        await axios.put(`/api/userTypes/${editingType.typeid}`, formData);
      } else {
        await axios.post('/api/userTypes', formData);
      }
      fetchUserTypes();
      handleClose();
    } catch (error) {
      console.error('Error saving user type:', error);
    }
  };

  const handleDelete = async (typeid: number) => {
    if (window.confirm(labels.messages.confirmDelete)) {
      try {
        await axios.delete(`/api/userTypes/${typeid}`);
        fetchUserTypes();
      } catch (error) {
        console.error('Error deleting user type:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {labels.userType.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {labels.buttons.addUserType}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{labels.userType.id}</TableCell>
              <TableCell>{labels.userType.name}</TableCell>
              <TableCell align="right">{labels.tableHeaders.user.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userTypes.map((type) => (
              <TableRow key={type.typeid}>
                <TableCell>{type.typeid}</TableCell>
                <TableCell>{type.typename}</TableCell>
                <TableCell align="right">
                  <Tooltip title={labels.buttons.edit}>
                    <IconButton onClick={() => handleOpen(type)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={labels.buttons.delete}>
                    <IconButton onClick={() => handleDelete(type.typeid)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingType ? labels.userType.edit : labels.userType.add}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={labels.userType.name}
              fullWidth
              value={formData.typename}
              onChange={(e) => setFormData({ ...formData, typename: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{labels.buttons.cancel}</Button>
            <Button type="submit" variant="contained">
              {editingType ? labels.buttons.update : labels.buttons.save}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserTypes;
