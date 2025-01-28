import React from 'react';
import { Box, TextField, Typography, Paper, SelectChangeEvent, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useLabelContext } from '../context/LabelContext';
import { useTheme } from '../context/ThemeContext';

const Admin: React.FC = () => {
  const { labels, updateLabels } = useLabelContext();
  const { theme, updateTheme } = useTheme();

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const path = name.split('.');
    const updatedLabels = { ...labels };
    let current: any = updatedLabels;
    
    // Traverse the path until the second-to-last element
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Update the value at the final path
    current[path[path.length - 1]] = value;
    
    updateLabels(updatedLabels);
  };

  const handleThemeChange = (e: SelectChangeEvent) => {
    const newTheme = e.target.value as 'default' | 'dark' | 'light';
    updateTheme(newTheme);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Theme Settings
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Theme</InputLabel>
          <Select
            value={theme || 'default'}
            label="Theme"
            onChange={handleThemeChange}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="light">Light</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Label Settings
        </Typography>
        <TextField 
          variant="filled" 
          label="App Title" 
          name="appTitle" 
          value={labels.appTitle} 
          onChange={handleLabelChange} 
          fullWidth 
          margin="normal"
          sx={{ backgroundColor: theme === 'dark' ? '#444' : theme === 'light' ? '#fff' : '#f7f7f7' }}
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Button Labels</Typography>
        <TextField 
          variant="filled" 
          label="Save Button" 
          name="buttons.save" 
          value={labels.buttons.save} 
          onChange={handleLabelChange} 
          fullWidth 
          margin="normal"
          sx={{ backgroundColor: theme === 'dark' ? '#444' : theme === 'light' ? '#fff' : '#f7f7f7' }}
        />
        <TextField 
          variant="filled" 
          label="Update Button" 
          name="buttons.update" 
          value={labels.buttons.update} 
          onChange={handleLabelChange} 
          fullWidth 
          margin="normal"
          sx={{ backgroundColor: theme === 'dark' ? '#444' : theme === 'light' ? '#fff' : '#f7f7f7' }}
        />
        <TextField 
          variant="filled" 
          label="Delete Button" 
          name="buttons.delete" 
          value={labels.buttons.delete} 
          onChange={handleLabelChange} 
          fullWidth 
          margin="normal"
          sx={{ backgroundColor: theme === 'dark' ? '#444' : theme === 'light' ? '#fff' : '#f7f7f7' }}
        />
      </Paper>
    </Box>
  );
};

export default Admin;
