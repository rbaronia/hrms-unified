import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import labels from '../utils/labels';
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
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/employees')}>
          {labels.buttons.cancel}
        </Button>
        <Typography variant="h5" component="h2" ml={2}>
          {id ? labels.employee.title + ' - ' + formData.firstname + ' ' + formData.lastname : 'New Employee'}
        </Typography>
      </Box>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6">{labels.formSections.basicInfo}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label={labels.employee.firstName}
              name="firstname"
              value={formData.firstname}
              onChange={handleTextFieldChange}
              error={!!formErrors.firstname}
              helperText={formErrors.firstname || labels.employee.validations.firstName}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label={labels.employee.lastName}
              name="lastname"
              value={formData.lastname}
              onChange={handleTextFieldChange}
              error={!!formErrors.lastname}
              helperText={formErrors.lastname || labels.employee.validations.lastName}
            />
          </Grid>

          {/* Contact Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6">{labels.formSections.contactInfo}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={labels.employee.streetAddr}
              name="streetaddr"
              value={formData.streetaddr}
              onChange={handleTextFieldChange}
              error={!!formErrors.streetaddr}
              helperText={formErrors.streetaddr || labels.employee.validations.streetAddr}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={labels.employee.city}
              name="city"
              value={formData.city}
              onChange={handleTextFieldChange}
              error={!!formErrors.city}
              helperText={formErrors.city || labels.employee.validations.city}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label={labels.employee.state}
              name="state"
              value={formData.state}
              onChange={handleTextFieldChange}
              error={!!formErrors.state}
              helperText={formErrors.state || labels.employee.validations.state}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label={labels.employee.zipCode}
              name="zipcode"
              value={formData.zipcode}
              onChange={handleTextFieldChange}
              error={!!formErrors.zipcode}
              helperText={formErrors.zipcode || labels.employee.validations.zipCode}
            />
          </Grid>

          {/* Job Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6">{labels.formSections.jobInfo}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{labels.employee.deptId}</InputLabel>
              <Select
                value={formData.deptid}
                name="deptid"
                onChange={handleSelectChange}
                label={labels.employee.deptId}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.deptid} value={dept.deptid.toString()}>
                    {dept.deptname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{labels.employee.typeId}</InputLabel>
              <Select
                value={formData.typeid}
                name="typeid"
                onChange={handleSelectChange}
                label={labels.employee.typeId}
              >
                {userTypes.map((type) => (
                  <MenuItem key={type.typeid} value={type.typeid.toString()}>
                    {type.typename}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={labels.employee.title}
              name="title"
              value={formData.title}
              onChange={handleTextFieldChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{labels.employee.manager}</InputLabel>
              <Select
                value={formData.manager || ''}
                name="manager"
                onChange={handleSelectChange}
                label={labels.employee.manager}
              >
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.userid}>
                    {`${manager.firstname} ${manager.lastname}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel>{labels.employee.isManager}</FormLabel>
              <RadioGroup
                row
                name="ismanager"
                value={formData.ismanager}
                onChange={handleCheckboxChange}
              >
                <FormControlLabel
                  value={labels.managerOptions.yes.value}
                  control={<Radio />}
                  label={labels.managerOptions.yes.label}
                />
                <FormControlLabel
                  value={labels.managerOptions.no.value}
                  control={<Radio />}
                  label={labels.managerOptions.no.label}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{labels.employee.eduLevel}</InputLabel>
              <Select
                value={formData.edulevel || ''}
                name="edulevel"
                onChange={handleSelectChange}
                label={labels.employee.eduLevel}
              >
                {labels.eduLevelOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel>{labels.employee.status}</FormLabel>
              <RadioGroup
                row
                name="status"
                value={formData.status}
                onChange={handleTextFieldChange}
              >
                <FormControlLabel
                  value={labels.statusOptions.active.value}
                  control={<Radio />}
                  label={labels.statusOptions.active.label}
                />
                <FormControlLabel
                  value={labels.statusOptions.inactive.value}
                  control={<Radio />}
                  label={labels.statusOptions.inactive.label}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* System Information Section */}
          <Grid item xs={12}>
            <Typography variant="h6">{labels.formSections.systemInfo}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label={labels.employee.userId}
              value={userId}
              InputProps={{
                readOnly: true,
              }}
              helperText="Automatically generated from first and last name"
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/employees')}
              >
                {labels.buttons.cancel}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {id ? labels.buttons.update : labels.buttons.save}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EmployeeForm;
