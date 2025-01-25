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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Department {
  deptid: number;
  deptname: string;
  parentid: number | null;
}

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    deptid: '',
    deptname: '',
    parentid: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/employees/departments');
      const sortedDepts = sortDepartmentsByHierarchy(response.data);
      setDepartments(sortedDepts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setLoading(false);
    }
  };

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        deptid: department.deptid.toString(),
        deptname: department.deptname,
        parentid: department.parentid?.toString() || '',
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        deptid: '',
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
      deptid: '',
      deptname: '',
      parentid: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await axios.put(`/api/employees/departments/${editingDepartment.deptid}`, {
          deptname: formData.deptname,
          parentid: formData.parentid ? parseInt(formData.parentid) : null,
        });
      } else {
        await axios.post('/api/employees/departments', {
          deptid: parseInt(formData.deptid),
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`/api/employees/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const findDepartmentLevel = (deptId: number): number => {
    let level = 0;
    let currentDept = departments.find(d => d.deptid === deptId);
    
    while (currentDept?.parentid) {
      level++;
      currentDept = departments.find(d => d.deptid === currentDept?.parentid);
    }
    
    return level;
  };

  const sortDepartmentsByHierarchy = (depts: Department[]): Department[] => {
    const result: Department[] = [];
    const added = new Set<number>();
    
    const addDepartmentWithChildren = (dept: Department, level: number = 0) => {
      if (!added.has(dept.deptid)) {
        result.push({
          ...dept,
          deptname: '\u00A0'.repeat(level * 4) + dept.deptname // Add proper indentation
        });
        added.add(dept.deptid);
        
        // Add child departments
        depts
          .filter(d => d.parentid === dept.deptid)
          .forEach(child => addDepartmentWithChildren(child, level + 1));
      }
    };
    
    // Start with root departments (no parent)
    depts
      .filter(d => !d.parentid)
      .forEach(dept => addDepartmentWithChildren(dept));
    
    // Handle any remaining departments (in case of circular references)
    depts.forEach(dept => {
      if (!added.has(dept.deptid)) {
        addDepartmentWithChildren(dept);
      }
    });
    
    return result;
  };

  const columns: GridColDef[] = [
    {
      field: 'deptname',
      headerName: 'Department Name',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Button
            onClick={() => handleOpenDialog(params.row)}
            size="small"
          >
            <EditIcon />
          </Button>
          <Button
            onClick={() => handleDelete(params.row.deptid)}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Departments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Department
        </Button>
      </Box>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={departments}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.deptid}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingDepartment ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {!editingDepartment && (
              <TextField
                fullWidth
                label="Department ID"
                name="deptid"
                type="number"
                value={formData.deptid}
                onChange={(e) => setFormData({ ...formData, deptid: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              fullWidth
              label="Department Name"
              name="deptname"
              value={formData.deptname}
              onChange={(e) => setFormData({ ...formData, deptname: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Parent Department</InputLabel>
              <Select
                value={formData.parentid}
                onChange={(e) => setFormData({ ...formData, parentid: e.target.value })}
                label="Parent Department"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem
                    key={dept.deptid}
                    value={dept.deptid}
                    disabled={editingDepartment?.deptid === dept.deptid}
                  >
                    {dept.deptname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default DepartmentList;
