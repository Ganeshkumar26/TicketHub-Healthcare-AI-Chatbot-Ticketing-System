import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Pagination,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../../utils/api';

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'open':
      return 'info';
    case 'in_progress':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'default';
    default:
      return 'default';
  }
};

// Helper function to get priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return 'success';
    case 'medium':
      return 'info';
    case 'high':
      return 'warning';
    case 'urgent':
      return 'error';
    default:
      return 'default';
  }
};

const TicketList = () => {
  
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors before fetching
        const res = await api.get('/tickets');
        
        // Check if response data is valid
        if (res.data && Array.isArray(res.data)) {
          setTickets(res.data);
          setFilteredTickets(res.data);
        } else {
          // Handle case where response is not an array
          setTickets([]);
          setFilteredTickets([]);
          setError('Invalid response format from server');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        // Set empty arrays regardless of error type
        setTickets([]);
        setFilteredTickets([]);
        
        // Set appropriate error message based on error type
        if (err.response) {
          // Server responded with an error status code
          setError(`Server error: ${err.response.data?.msg || 'Failed to load tickets'}`);
        } else if (err.request) {
          // Request was made but no response received (network error)
          setError('Cannot connect to server. Please check your connection or if the server is running.');
        } else {
          // Something else caused the error
          setError('An unexpected error occurred. Please try again.');
        }
        
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...tickets];
    
    if (filters.status) {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.priority) {
      result = result.filter(ticket => ticket.priority === filters.priority);
    }
    
    if (filters.category) {
      result = result.filter(ticket => ticket.category === filters.category);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm) || 
        ticket.description.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredTickets(result);
  }, [filters, tickets]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      search: ''
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography component="h1" variant="h5">
            Tickets
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/tickets/new"
          >
            New Ticket
          </Button>
        </Box>
        
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              name="search"
              label="Search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={filters.priority}
                label="Priority"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={filters.category}
                label="Category"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="appointment">Appointment</MenuItem>
                <MenuItem value="prescription">Prescription</MenuItem>
                <MenuItem value="billing">Billing</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={clearFilters}
              sx={{ height: '100%' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Ticket List */}
        <Divider sx={{ mb: 2 }} />
        {filteredTickets.length > 0 ? (
          <List>
            {filteredTickets.map((ticket) => (
              <React.Fragment key={ticket._id}>
                <ListItem
                  button
                  component={RouterLink}
                  to={`/tickets/${ticket._id}`}
                  alignItems="flex-start"
                  sx={{ py: 2 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        {ticket.title}
                      </Typography>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                          {`Created: ${new Date(ticket.createdAt).toLocaleString()}`}
                          {ticket.updatedAt !== ticket.createdAt && 
                            ` | Updated: ${new Date(ticket.updatedAt).toLocaleString()}`}
                        </Typography>
                        <Typography variant="body2">
                          {ticket.description.substring(0, 100)}{ticket.description.length > 100 ? '...' : ''}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, minWidth: 120 }}>
                    <Chip
                      label={ticket.status.replace('_', ' ')}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                    <Chip
                      label={ticket.priority}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={ticket.category}
                      size="small"
                      variant="outlined"
                    />
                    {ticket.aiResponded && (
                      <Chip
                        label="AI Responded"
                        color="secondary"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
            No tickets found. {tickets.length > 0 ? 'Try adjusting your filters.' : 'Create your first ticket to get started.'}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default TicketList;