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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import labels from '../utils/labels';
import { Department } from '../types/user';

interface DepartmentWithMeta extends Department {
  id: string;
  parentName?: string;
  level?: number;
  indentedName?: string;
}

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentWithMeta | null>(null);
  const [formData, setFormData] = useState({
    deptname: '',
    parentid: '',
  });

  const processHierarchy = (depts: Department[]): DepartmentWithMeta[] => {
    const deptMap = new Map<string, DepartmentWithMeta>();
    const result: DepartmentWithMeta[] = [];

    // First pass: Create department objects and build the map
    depts.forEach(dept => {
      deptMap.set(dept.deptid.toString(), {
        ...dept,
        id: dept.deptid.toString(),
        level: 0,
        indentedName: dept.deptname
      });
    });

    // Second pass: Process hierarchy and set parent names
    depts.forEach(dept => {
      const currentDept = deptMap.get(dept.deptid.toString());
      if (currentDept) {
        if (dept.parentid) {
          const parentDept = deptMap.get(dept.parentid.toString());
          if (parentDept) {
            currentDept.parentName = parentDept.deptname;
            currentDept.level = (parentDept.level || 0) + 1;
            currentDept.indentedName = '  '.repeat(currentDept.level) + currentDept.deptname;
          }
        }
        result.push(currentDept);
      }
    });

    return result;
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.api.get('/departments');
      const processedDepts = processHierarchy(response.data);
      setDepartments(processedDepts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenDialog = (department?: DepartmentWithMeta) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        deptname: department.deptname,
        parentid: department.parentid?.toString() || '',
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        deptname: '',
        parentid: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDepartment(null);
    setFormData({
      deptname: '',
      parentid: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await api.api.put(`/departments/${editingDepartment.deptid}`, {
          deptname: formData.deptname,
          parentid: formData.parentid ? parseInt(formData.parentid) : null,
        });
      } else {
        await api.api.post('/departments', {
          deptname: formData.deptname,
          parentid: formData.parentid ? parseInt(formData.parentid) : null,
        });
      }
      handleCloseDialog();
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(labels.messages.confirmDelete)) {
      try {
        await api.api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'deptid', headerName: labels.department.id, width: 100 },
    { field: 'indentedName', headerName: labels.department.name, width: 300 },
    { field: 'parentName', headerName: labels.department.parent, width: 200 },
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
            {labels.buttons.edit}
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => handleDelete(params.row.deptid)}
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
          {labels.department.title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {labels.buttons.addDepartment}
        </Button>
      </Box>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={departments}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.deptid}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingDepartment ? labels.department.edit : labels.department.add}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={labels.department.name}
              fullWidth
              required
              name="deptname"
              value={formData.deptname}
              onChange={(e) => setFormData({ ...formData, deptname: e.target.value })}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{labels.department.parent}</InputLabel>
              <Select
                value={formData.parentid}
                onChange={(e) => setFormData({ ...formData, parentid: e.target.value })}
                label={labels.department.parent}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem
                    key={dept.deptid}
                    value={dept.deptid.toString()}
                    disabled={editingDepartment?.deptid === dept.deptid}
                  >
                    {dept.indentedName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{labels.buttons.cancel}</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingDepartment ? labels.buttons.update : labels.buttons.save}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default DepartmentList;
