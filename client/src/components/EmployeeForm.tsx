import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Paper,
  Typography,
  Box,
  Alert,
  FormLabel,
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface UserType {
  typeid: number;
  typename: string;
}

interface Department {
  deptid: number;
  parentid: number | null;
  deptname: string;
  children: Department[];
}

interface Manager {
  id: number;
  firstname: string;
  lastname: string;
  userid: string;
}

interface FormData {
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
}

const initialFormData: FormData = {
  firstname: '',
  lastname: '',
  streetaddr: '',
  city: '',
  state: '',
  zipcode: '',
  title: '',
  manager: '',
  ismanager: '0',
  edulevel: '',
  status: '0',
  deptid: '',
  typeid: ''
};

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [userId, setUserId] = useState<string>('');

  const [managers, setManagers] = useState<Manager[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [apiError, setApiError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');

        // Fetch managers
        console.log('Fetching managers...');
        const managersResponse = await axios.get<Manager[]>('/api/employees/managers');
        console.log('Managers response:', managersResponse);
        setManagers(managersResponse.data);

        // Fetch departments
        console.log('Fetching departments...');
        const departmentsResponse = await axios.get<Department[]>('/api/employees/departments');
        console.log('Departments response:', departmentsResponse);
        const depts = departmentsResponse.data;
        
        // Build department hierarchy
        const processedDepts = new Set<number>();
        const buildHierarchy = (parentId: number | null = null, level: number = 0): Department[] => {
          return depts
            .filter(d => d.parentid === parentId && !processedDepts.has(d.deptid))
            .sort((a, b) => a.deptname.localeCompare(b.deptname))
            .map(dept => {
              processedDepts.add(dept.deptid);
              return {
                ...dept,
                deptname: '\u00A0\u00A0\u00A0\u00A0'.repeat(level) + dept.deptname,
                children: buildHierarchy(dept.deptid, level + 1)
              };
            });
        };

        // Flatten hierarchy with indentation preserved
        const flattenHierarchy = (deps: Department[]): Department[] => {
          const flattened: Department[] = [];
          const flatten = (departments: Department[]) => {
            departments.forEach(dept => {
              flattened.push(dept);
              if (dept.children && dept.children.length > 0) {
                flatten(dept.children);
              }
            });
          };
          flatten(deps);
          return flattened;
        };

        const hierarchy = buildHierarchy();
        const flattenedDepts = flattenHierarchy(hierarchy);
        setDepartments(flattenedDepts);

        // Fetch user types
        console.log('Fetching user types...');
        const userTypesResponse = await axios.get<UserType[]>('/api/employees/usertypes');
        console.log('User types response:', userTypesResponse);
        setUserTypes(userTypesResponse.data);

        // If editing, fetch employee data
        if (id) {
          console.log('Fetching employee data for id:', id);
          const employeeResponse = await axios.get(`/api/employees/${id}`);
          console.log('Employee response:', employeeResponse);
          const employeeData = employeeResponse.data;
          setFormData({
            ...employeeData,
            ismanager: employeeData.ismanager ? '1' : '0',
            status: employeeData.status.toString(),
            deptid: employeeData.deptid?.toString() || '',
            typeid: employeeData.typeid?.toString() || ''
          });
          setUserId(employeeData.userid);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setApiError('Failed to load required data. Please try again.');
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    console.log('Current userTypes state:', userTypes);
  }, [userTypes]);

  const generateUserId = async (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return;
    
    try {
      const baseUserId = (firstName.charAt(0) + lastName).toLowerCase();
      console.log('Checking availability for userId:', baseUserId);
      
      // Check if this userId exists
      const response = await axios.get(`/api/employees/checkUserId/${baseUserId}`);
      const { exists, suggestedId } = response.data;
      
      setUserId(suggestedId || baseUserId);
    } catch (error) {
      console.error('Error generating userId:', error);
    }
  };

  useEffect(() => {
    if (formData.firstname && formData.lastname) {
      generateUserId(formData.firstname, formData.lastname);
    }
  }, [formData.firstname, formData.lastname]);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Handling text field change for ${name}:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    console.log(`Handling select change for ${name}:`, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name as keyof FormData]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? '1' : '0'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    // Validate form
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstname) errors.firstname = 'First name is required';
    if (!formData.lastname) errors.lastname = 'Last name is required';
    if (!formData.deptid) errors.deptid = 'Department is required';
    if (!formData.typeid) errors.typeid = 'User type is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        ...formData,
        userid: userId,
      };

      if (id) {
        await axios.put(`/api/employees/${id}`, payload);
        setSuccessMessage('Employee updated successfully');
      } else {
        await axios.post('/api/employees', payload);
        setSuccessMessage('Employee created successfully');
      }

      // Wait for 1 second to show the success message
      setTimeout(() => {
        navigate('/employees');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving employee:', error);
      setApiError(error.response?.data?.error || 'Failed to save employee. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/employees/${id}`);
        setSuccessMessage('Employee deleted successfully');
        setTimeout(() => {
          navigate('/employees');
        }, 1000);
      } catch (error: any) {
        console.error('Error deleting employee:', error);
        setApiError(error.response?.data?.error || 'Failed to delete employee. Please try again.');
      }
    }
  };

  const handleCloseError = () => {
    setApiError('');
  };

  const handleCloseSuccess = () => {
    setSuccessMessage('');
  };

  return (
    <>
      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <Paper elevation={3} sx={{ p: 3, m: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {id ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={handleTextFieldChange}
                required
                error={!!formErrors.firstname}
                helperText={formErrors.firstname}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleTextFieldChange}
                required
                error={!!formErrors.lastname}
                helperText={formErrors.lastname}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User ID"
                value={userId}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Automatically generated from first and last name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="streetaddr"
                value={formData.streetaddr}
                onChange={handleTextFieldChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleTextFieldChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleTextFieldChange}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleTextFieldChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleTextFieldChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select<string>
                  name="manager"
                  value={formData.manager}
                  onChange={handleSelectChange}
                  label="Manager"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {managers.map((manager) => (
                    <MenuItem key={manager.userid} value={manager.userid}>
                      {`${manager.firstname} ${manager.lastname} (${manager.userid})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Education Level"
                name="edulevel"
                value={formData.edulevel}
                onChange={handleTextFieldChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.deptid}>
                <InputLabel>Department</InputLabel>
                <Select<string>
                  name="deptid"
                  value={formData.deptid}
                  onChange={handleSelectChange}
                  label="Department"
                  required
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem 
                      key={dept.deptid} 
                      value={dept.deptid.toString()}
                      sx={{ 
                        whiteSpace: 'pre',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                      }}
                    >
                      {dept.deptname}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.deptid && (
                  <FormHelperText>{formErrors.deptid}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.typeid}>
                <InputLabel>User Type</InputLabel>
                <Select<string>
                  name="typeid"
                  value={formData.typeid}
                  onChange={handleSelectChange}
                  label="User Type"
                  required
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {userTypes.map((type) => (
                    <MenuItem key={type.typeid} value={type.typeid.toString()}>
                      {type.typename}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.typeid && (
                  <FormHelperText>{formErrors.typeid}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel>User Status</FormLabel>
                <RadioGroup
                  row
                  name="status"
                  value={formData.status}
                  onChange={handleTextFieldChange}
                >
                  <FormControlLabel
                    value="0"
                    control={<Radio />}
                    label="Active"
                  />
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    label="Disabled"
                  />
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label="Terminated"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="ismanager"
                    checked={formData.ismanager === '1'}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Is Manager"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {id ? 'Save Changes' : 'Create Employee'}
                </Button>
                {id && (
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={handleDelete}
                  >
                    Delete Employee
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => navigate('/employees')}
                startIcon={<ArrowBack />}
                sx={{ mt: 2 }}
              >
                Back to Employees
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

export default EmployeeForm;
