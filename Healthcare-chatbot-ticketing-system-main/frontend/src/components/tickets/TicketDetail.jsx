import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton
} from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [priorityUpdate, setPriorityUpdate] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tickets/${id}`);
        setTicket(res.data);
        setStatusUpdate(res.data.status);
        setPriorityUpdate(res.data.priority);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError(err.response?.data?.msg || 'Failed to load ticket. Please try again.');
        setLoading(false);
      }
    };

    fetchTicket();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchTicket, 10000);
    return () => clearInterval(interval);
  }, [id]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSendingMessage(true);
      await api.post(`/tickets/${id}/messages`, { content: message });
      setMessage('');
      
      // Fetch updated ticket data
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
      setSendingMessage(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.msg || 'Failed to send message. Please try again.');
      setSendingMessage(false);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      setLoading(true);
      await api.put(`/tickets/${id}`, {
        status: statusUpdate,
        priority: priorityUpdate
      });
      
      // Fetch updated ticket data
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError(err.response?.data?.msg || 'Failed to update ticket. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !ticket) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !ticket) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/tickets')}>
            Back to Tickets
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {ticket && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton onClick={() => navigate('/tickets')} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography component="h1" variant="h5">
                {ticket.title}
              </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Created by:</strong> {ticket.user?.name || 'Unknown'}
                </Typography>
                {ticket.assignedTo && (
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Assigned to:</strong> {ticket.assignedTo.name}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    label={`Status: ${ticket.status.replace('_', ' ')}`}
                    color={getStatusColor(ticket.status)}
                  />
                  <Chip
                    label={`Priority: ${ticket.priority}`}
                    color={getPriorityColor(ticket.priority)}
                  />
                  <Chip label={`Category: ${ticket.category}`} />
                </Box>
                
                {/* Status and Priority Update (for healthcare providers and admins) */}
                {(user?.role === 'healthcare_provider' || user?.role === 'admin') && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="status-update-label">Status</InputLabel>
                      <Select
                        labelId="status-update-label"
                        id="status-update"
                        value={statusUpdate}
                        label="Status"
                        onChange={(e) => setStatusUpdate(e.target.value)}
                      >
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="priority-update-label">Priority</InputLabel>
                      <Select
                        labelId="priority-update-label"
                        id="priority-update"
                        value={priorityUpdate}
                        label="Priority"
                        onChange={(e) => setPriorityUpdate(e.target.value)}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={handleUpdateTicket}
                      disabled={statusUpdate === ticket.status && priorityUpdate === ticket.priority}
                    >
                      Update
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {ticket.description}
            </Typography>
          </Paper>
          
          {/* Chat Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Messages
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2, 
              maxHeight: '400px', 
              overflowY: 'auto',
              mb: 3,
              p: 1
            }}>
              {ticket.messages.length > 0 ? (
                ticket.messages.map((msg, index) => (
                  <Box 
                    key={index} 
                    sx={{
                      display: 'flex',
                      flexDirection: msg.isAI ? 'row' : (msg.sender?._id === user?.id ? 'row-reverse' : 'row'),
                      gap: 1,
                      maxWidth: '80%',
                      alignSelf: msg.isAI ? 'flex-start' : (msg.sender?._id === user?.id ? 'flex-end' : 'flex-start'),
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: msg.isAI ? 'secondary.main' : (msg.sender?._id === user?.id ? 'primary.main' : 'grey.500'),
                        width: 36, 
                        height: 36 
                      }}
                    >
                      {msg.isAI ? 'AI' : (msg.sender?.name?.charAt(0) || 'U')}
                    </Avatar>
                    <Box>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          bgcolor: msg.isAI ? 'secondary.light' : (msg.sender?._id === user?.id ? 'primary.light' : 'grey.100'),
                          color: msg.isAI || msg.sender?._id === user?.id ? 'white' : 'inherit',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body1">
                          {msg.content}
                        </Typography>
                      </Paper>
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {msg.isAI ? 'AI Assistant' : (msg.sender?.name || 'Unknown')} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                  No messages yet. Start the conversation!
                </Typography>
              )}
              <div ref={messagesEndRef} />
            </Box>
            
            {/* Message Input */}
            {ticket.status !== 'closed' && (
              <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendingMessage}
                  variant="outlined"
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={!message.trim() || sendingMessage}
                >
                  {sendingMessage ? <CircularProgress size={24} /> : 'Send'}
                </Button>
              </Box>
            )}
            
            {ticket.status === 'closed' && (
              <Alert severity="info">
                This ticket is closed. No new messages can be added.
              </Alert>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};

export default TicketDetail;