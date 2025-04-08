import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';

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

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tickets');
        setTickets(res.data);
        
        // Calculate stats
        const total = res.data.length;
        const open = res.data.filter(ticket => ticket.status === 'open').length;
        const inProgress = res.data.filter(ticket => ticket.status === 'in_progress').length;
        const resolved = res.data.filter(ticket => ticket.status === 'resolved').length;
        const closed = res.data.filter(ticket => ticket.status === 'closed').length;
        
        setStats({ total, open, inProgress, resolved, closed });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again later.');
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

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
            RETRY
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h1" variant="h5">
                Welcome, {user?.name || 'User'}!
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
            <Typography variant="body1">
              {user?.role === 'patient' 
                ? 'Use the ticketing system to communicate with healthcare providers and get assistance.'
                : 'Manage patient tickets and provide healthcare assistance.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.main',
              color: 'white'
            }}
          >
            <Typography component="h2" variant="h6" gutterBottom>
              Total Tickets
            </Typography>
            <Typography component="p" variant="h3">
              {stats.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'row', height: 140 }}>
            <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee' }}>
              <Typography variant="h6" color="info.main">
                Open
              </Typography>
              <Typography variant="h4">{stats.open}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee' }}>
              <Typography variant="h6" color="warning.main">
                In Progress
              </Typography>
              <Typography variant="h4">{stats.inProgress}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee' }}>
              <Typography variant="h6" color="success.main">
                Resolved
              </Typography>
              <Typography variant="h4">{stats.resolved}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Closed
              </Typography>
              <Typography variant="h4">{stats.closed}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Tickets */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Tickets
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {tickets.length > 0 ? (
              <List>
                {tickets.slice(0, 5).map((ticket) => (
                  <React.Fragment key={ticket._id}>
                    <ListItem
                      button
                      component={RouterLink}
                      to={`/tickets/${ticket._id}`}
                      alignItems="flex-start"
                    >
                      <ListItemText
                        primary={ticket.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </Typography>
                            {` — ${ticket.description.substring(0, 60)}${ticket.description.length > 60 ? '...' : ''}`}
                          </React.Fragment>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
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
                      </Box>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ py: 2, textAlign: 'center' }}>
                No tickets found. Create your first ticket to get started.
              </Typography>
            )}
            {tickets.length > 5 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button component={RouterLink} to="/tickets" color="primary">
                  View All Tickets
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;