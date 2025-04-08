import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import api from '../../utils/api';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { title, description, category, priority } = formData;

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!category) errors.category = 'Category is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.post('/tickets', formData);
        
        setSuccess(true);
        setLoading(false);
        
        // Redirect to the new ticket after a short delay
        setTimeout(() => {
          navigate(`/tickets/${res.data._id}`);
        }, 1500);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to create ticket. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Create New Ticket
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Ticket created successfully! Redirecting...
          </Alert>
        )}
        
        <Box component="form" onSubmit={onSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Ticket Title"
            name="title"
            autoFocus
            value={title}
            onChange={onChange}
            error={!!formErrors.title}
            helperText={formErrors.title}
            disabled={loading || success}
          />
          
          <FormControl fullWidth margin="normal" error={!!formErrors.category} disabled={loading || success}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={category}
              label="Category"
              onChange={onChange}
            >
              <MenuItem value="">Select a category</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="appointment">Appointment</MenuItem>
              <MenuItem value="prescription">Prescription</MenuItem>
              <MenuItem value="billing">Billing</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {formErrors.category && (
              <Typography variant="caption" color="error">
                {formErrors.category}
              </Typography>
            )}
          </FormControl>
          
          <FormControl fullWidth margin="normal" disabled={loading || success}>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name="priority"
              value={priority}
              label="Priority"
              onChange={onChange}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={6}
            value={description}
            onChange={onChange}
            error={!!formErrors.description}
            helperText={formErrors.description}
            disabled={loading || success}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/tickets')}
              disabled={loading || success}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Ticket'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateTicket;