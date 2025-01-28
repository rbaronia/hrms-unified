import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLabelContext } from '../context/LabelContext';
import {
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Typography,
  Box,
  Alert,
  FormLabel,
  FormHelperText,
  CircularProgress,
  SelectChangeEvent,
  Checkbox,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../utils/api';
import {
  Manager,
  Department,
  UserType,
  EduLevel,
  Status,
  IsManager,
  Option
} from '../types/user';

interface RawDepartment {
  deptid: number;
  deptname: string;
  parentid: number | null;
}

interface RawUserType {
  typeid: number;
  typename: string;
}

interface RawManager {
  id: number;
  firstname: string;
  lastname: string;
  userid: string;
  displayName?: string;
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
  userid: string;
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
  edulevel: 'HS',
  status: '0',
  deptid: '',
  typeid: '',
  userid: ''
};

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { labels } = useLabelContext();
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('UserForm: Starting data fetch');
        setLoading(true);
        setApiError('');
        setSuccessMessage('');

        // First, fetch all required data
        console.log('UserForm: Fetching departments, user types, and managers');
        const [departmentsRes, userTypesRes, managersRes] = await Promise.all([
          api.endpoints.departments.getAll(),
          api.endpoints.userTypes.getAll(),
          api.endpoints.users.getManagers()
        ]).catch(error => {
          console.error('UserForm: Error fetching initial data:', error);
          throw new Error('Failed to load required data. Please try again.');
        });

        console.log('UserForm: Raw API responses:', {
          departments: departmentsRes?.data,
          userTypes: userTypesRes?.data,
          managers: managersRes?.data
        });

        if (!departmentsRes?.data || !userTypesRes?.data) {
          throw new Error('Failed to fetch required data');
        }

        // Process departments to include hierarchy information
        const processHierarchy = (depts: RawDepartment[], parentId: number | null = null, level: number = 0): Department[] => {
          const result: Department[] = [];
          
          depts
            .filter(dept => dept.parentid === parentId)
            .forEach(dept => {
              const withMeta = {
                deptid: dept.deptid,
                deptname: dept.deptname,
                parentid: dept.parentid,
                level
              };
              result.push(withMeta);
              
              const children = processHierarchy(depts, dept.deptid, level + 1);
              result.push(...children);
            });
          
          return result;
        };

        // Process user types to match our interface
        const processedUserTypes = userTypesRes.data.map((type: RawUserType) => ({
          typeid: type.typeid,
          typename: type.typename
        }));

        const processedDepartments = processHierarchy(departmentsRes.data);
        console.log('UserForm: Processed data:', {
          departments: processedDepartments,
          userTypes: processedUserTypes
        });
        
        setDepartments(processedDepartments);
        setUserTypes(processedUserTypes);

        // Process managers to add displayName
        if (managersRes?.data) {
          const processedManagers = managersRes.data.map((manager: RawManager) => ({
            ...manager,
            displayName: manager.displayName || `${manager.firstname} ${manager.lastname}`
          }));
          setManagers(processedManagers);
        }

        // If editing an existing user, fetch their data
        if (id) {
          console.log('UserForm: Fetching user data for ID:', id);
          try {
            const userRes = await api.endpoints.users.getById(parseInt(id));
            console.log('UserForm: User data response:', userRes?.data);
            
            if (!userRes?.data) {
              throw new Error('User not found');
            }

            const userData = userRes.data;
            setFormData({
              firstname: userData.firstname || '',
              lastname: userData.lastname || '',
              streetaddr: userData.streetaddr || '',
              city: userData.city || '',
              state: userData.state || '',
              zipcode: userData.zipcode || '',
              title: userData.title || '',
              manager: userData.manager_id?.toString() || '',
              ismanager: userData.ismanager?.toString() || '0',
              edulevel: userData.edulevel || 'HS',
              status: userData.status?.toString() || '0',
              deptid: userData.deptid?.toString() || '',
              typeid: userData.typeid?.toString() || '',
              userid: userData.userid || ''
            });
          } catch (error: any) {
            console.error('UserForm: Error fetching user data:', error);
            const errorMessage = error.response?.status === 404 
              ? 'User not found. They may have been deleted.'
              : 'Failed to load user data. Please try again.';
            throw new Error(errorMessage);
          }
        }
      } catch (error: any) {
        console.error('UserForm: Error in data fetch:', error);
        setApiError(error.message || 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
        console.log('UserForm: Data fetch complete');
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApiError('');
      setSuccessMessage('');
      
      const payload = {
        ...formData,
        ismanager: parseInt(formData.ismanager || '0'),
        status: parseInt(formData.status || '1'),
        deptid: formData.deptid ? parseInt(formData.deptid) : null,
        typeid: formData.typeid ? parseInt(formData.typeid) : null,
        manager: formData.manager ? parseInt(formData.manager) : null
      };

      if (id) {
        await api.endpoints.users.update(parseInt(id), payload);
        setSuccessMessage('User updated successfully');
      } else {
        await api.endpoints.users.create(payload);
        setSuccessMessage('User created successfully');
      }

      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (error: any) {
      console.error('UserForm: Error saving user:', error);
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        setApiError(error.response?.data?.message || 'Failed to save user. Please try again.');
      }
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Generate user ID when first name or last name changes
    if ((name === 'firstname' || name === 'lastname') && !id) {
      const updatedData = {
        ...formData,
        [name]: value
      };

      if (updatedData.firstname && updatedData.lastname) {
        try {
          const response = await api.endpoints.users.generateUserId(
            updatedData.firstname.trim(),
            updatedData.lastname.trim()
          );
          
          if (response?.data?.userId) {
            setFormData(prev => ({
              ...prev,
              [name]: value,
              userid: response.data.userId
            }));
          }
        } catch (error) {
          console.error('Error generating user ID:', error);
          // Don't show error to user as this is a background operation
        }
      }
    }

    // Clear validation error when user starts typing
    if (validationErrors[name as keyof FormData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const name = event.target.name as keyof FormData;
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={3} display="flex" alignItems="center">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/users')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">
          {id ? 'Edit User' : 'Create New User'}
        </Typography>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Loading user data...
            </Typography>
          </Box>
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label={labels.user.firstName}
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  error={!!validationErrors.firstname}
                  helperText={validationErrors.firstname}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label={labels.user.lastName}
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  error={!!validationErrors.lastname}
                  helperText={validationErrors.lastname}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="User ID"
                  name="userid"
                  value={formData.userid}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      bgcolor: 'action.hover',
                      '& .MuiInputBase-input': {
                        color: 'text.secondary',
                      }
                    }
                  }}
                  helperText={
                    id ? "User ID cannot be changed" : 
                    formData.userid ? "Auto-generated based on name" :
                    "Will be auto-generated when you enter first and last name"
                  }
                />
              </Grid>

              {/* Contact Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={labels.user.streetAddr}
                  name="streetaddr"
                  value={formData.streetaddr}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={labels.user.city}
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label={labels.user.state}
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label={labels.user.zipCode}
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Employment Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Employment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{labels.user.department}</InputLabel>
                  <Select
                    name="deptid"
                    value={formData.deptid}
                    onChange={handleSelectChange}
                    label={labels.user.department}
                  >
                    <MenuItem value="">
                      <em>Select Department</em>
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem 
                        key={dept.deptid} 
                        value={dept.deptid?.toString() || ''}
                        sx={{ pl: dept.level ? `${dept.level * 2}rem` : 0 }}
                      >
                        {dept.deptname}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>{labels.user.userType}</InputLabel>
                  <Select
                    name="typeid"
                    value={formData.typeid}
                    onChange={handleSelectChange}
                    label={labels.user.userType}
                  >
                    <MenuItem value="">
                      <em>Select User Type</em>
                    </MenuItem>
                    {userTypes.map((type) => (
                      <MenuItem key={type.typeid} value={type.typeid?.toString() || ''}>
                        {type.typename}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={labels.user.position}
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{labels.user.manager}</InputLabel>
                  <Select
                    name="manager"
                    value={formData.manager}
                    onChange={handleSelectChange}
                    label={labels.user.manager}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {managers.map((manager) => (
                      <MenuItem key={manager.id} value={manager.id?.toString() || ''}>
                        {manager.displayName} ({manager.userid})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Additional Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{labels.user.educationLevel}</InputLabel>
                  <Select
                    name="edulevel"
                    value={formData.edulevel}
                    onChange={handleSelectChange}
                    label={labels.user.educationLevel}
                  >
                    <MenuItem value="HS">{labels.user.educationLevelOptions.hs}</MenuItem>
                    <MenuItem value="BE">{labels.user.educationLevelOptions.be}</MenuItem>
                    <MenuItem value="MS">{labels.user.educationLevelOptions.ms}</MenuItem>
                    <MenuItem value="PHD">{labels.user.educationLevelOptions.phd}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.ismanager === '1'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          ismanager: e.target.checked ? '1' : '0'
                        }));
                      }}
                    />
                  }
                  label={labels.user.isManager}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{labels.user.status}</FormLabel>
                  <RadioGroup
                    row
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="0" control={<Radio />} label="Active" />
                    <FormControlLabel value="1" control={<Radio />} label="Disabled" />
                    <FormControlLabel value="2" control={<Radio />} label="Terminated" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Form Actions */}
              <Grid item xs={12}>
                <Divider sx={{ mt: 2, mb: 2 }} />
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/users')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : (id ? 'Update' : 'Save')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
    </Box>
  );
};

export default UserForm;
