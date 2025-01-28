import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useLabelContext } from '../context/LabelContext';
import labels from '../utils/labels';

const AdminPanel: React.FC = () => {
  const { updateLabels } = useLabelContext();
  const [labelsText, setLabelsText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Convert labels object to formatted JSON string
    const formattedLabels = JSON.stringify(labels, null, 2);
    setLabelsText(formattedLabels);
  }, []);

  const handleSave = () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Parse the JSON to validate it
      const newLabels = JSON.parse(labelsText);

      // Save to localStorage for persistence
      localStorage.setItem('customLabels', JSON.stringify(newLabels));

      // Update the labels context
      updateLabels(newLabels);

      setSuccess('Labels updated successfully! The changes will be reflected immediately.');
    } catch (err: any) {
      setError(`Invalid JSON format: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default labels
    setLabelsText(JSON.stringify(labels, null, 2));
    localStorage.removeItem('customLabels');
    updateLabels(labels);
    setSuccess('Labels reset to default values.');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          System Configuration
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Labels Editor</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="textSecondary" paragraph>
              Edit the labels below to customize the text displayed throughout the application.
              Changes will be applied immediately after saving.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={20}
              value={labelsText}
              onChange={(e) => setLabelsText(e.target.value)}
              variant="outlined"
              sx={{ fontFamily: 'monospace', mb: 2 }}
            />

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Reset to Default
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default AdminPanel;
