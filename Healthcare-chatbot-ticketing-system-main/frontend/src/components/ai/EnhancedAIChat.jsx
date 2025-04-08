import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Switch,
  FormControlLabel,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  HealthAndSafety as HealthIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';

/**
 * Enhanced AI Chat Component
 * 
 * This component demonstrates the integration of enhanced AI features:
 * - HIPAA compliance checking
 * - Voice interface
 * - Medical triage
 * - Doctor recommendations
 * - EHR integration
 */
const EnhancedAIChat = ({ ticketId, category }) => {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [ehrConsent, setEhrConsent] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Fetch ticket messages if ticketId is provided
  useEffect(() => {
    if (ticketId) {
      const fetchTicket = async () => {
        try {
          const res = await api.get(`/tickets/${ticketId}`);
          setMessages(res.data.messages || []);
          // Check if user has EHR consent
          setEhrConsent(user?.ehrConsent || false);
        } catch (err) {
          console.error('Error fetching ticket:', err);
          setError('Failed to load conversation history');
        }
      };
      
      fetchTicket();
    }
  }, [ticketId, user]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle text message submission
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      setLoading(true);
      
      // Add user message to UI immediately
      const userMessage = {
        sender: user?.id,
        content: message,
        isAI: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Check for HIPAA compliance
      const complianceRes = await api.post('/api/enhanced-ai/hipaa-check', { message });
      
      // If PHI detected, show warning
      if (complianceRes.data.containsPHI) {
        setMessages(prev => [...prev, {
          isAI: true,
          content: `⚠️ Your message may contain protected health information (PHI). For your privacy, consider removing personal identifiers.`,
          timestamp: new Date().toISOString(),
          isWarning: true
        }]);
      }
      
      // Process with enhanced AI
      const aiRes = await api.post('/api/enhanced-ai/analyze', {
        message,
        category,
        ticketId
      });
      
      // Add AI response to messages
      const aiMessage = {
        isAI: true,
        content: aiRes.data.textResponse,
        timestamp: new Date().toISOString(),
        triageResult: aiRes.data.triageResult,
        voiceResponse: aiRes.data.voiceResponse
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Play voice response if enabled
      if (voiceEnabled && aiRes.data.voiceResponse) {
        // In a real implementation, this would play the audio data
        console.log('Would play voice response:', aiRes.data.voiceResponse);
      }
      
      // If this isn't associated with a ticket, we need to handle messages locally
      if (!ticketId) {
        // In a real implementation, you might store these in local storage
      }
      
      setMessage('');
      setLoading(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle voice recording
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setAudioData(audioBlob);
          setIsRecording(false);
          
          // Auto-send the audio
          handleSendVoiceMessage(audioBlob);
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        setError('Could not access microphone. Please check permissions.');
      }
    }
  };
  
  // Send voice message
  const handleSendVoiceMessage = async (blob) => {
    if (!blob) return;
    
    try {
      setLoading(true);
      
      // Create form data with audio
      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('category', category);
      if (ticketId) {
        formData.append('ticketId', ticketId);
      }
      
      // Add a placeholder message
      setMessages(prev => [...prev, {
        sender: user?.id,
        content: '🎤 Voice message (processing...)',
        isAI: false,
        isVoice: true,
        timestamp: new Date().toISOString()
      }]);
      
      // Send to voice API
      const res = await api.post('/api/enhanced-ai/voice', formData);
      
      // Update the placeholder with transcribed text
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex].isVoice) {
          updated[lastIndex].content = `🎤 ${res.data.transcription.transcribedText}`;
        }
        return updated;
      });
      
      // Add AI response
      setMessages(prev => [...prev, {
        isAI: true,
        content: res.data.response.textResponse,
        timestamp: new Date().toISOString(),
        triageResult: res.data.response.triageResult,
        voiceResponse: res.data.response.voiceResponse
      }]);
      
      // Play voice response if enabled
      if (voiceEnabled && res.data.response.voiceResponse) {
        // In a real implementation, this would play the audio data
        console.log('Would play voice response:', res.data.response.voiceResponse);
      }
      
      setAudioData(null);
      setLoading(false);
    } catch (err) {
      console.error('Error sending voice message:', err);
      setError('Failed to process voice message. Please try again.');
      setLoading(false);
      
      // Update the placeholder to show error
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex].isVoice) {
          updated[lastIndex].content = '🎤 Voice message (processing failed)';
          updated[lastIndex].isError = true;
        }
        return updated;
      });
    }
  };
  
  // Toggle EHR consent
  const handleToggleEhrConsent = async () => {
    try {
      const newConsentValue = !ehrConsent;
      
      // Update consent in backend
      await api.post('/api/enhanced-ai/ehr-consent', {
        consent: newConsentValue
      });
      
      setEhrConsent(newConsentValue);
      
      // Add system message about consent change
      setMessages(prev => [...prev, {
        isAI: true,
        content: newConsentValue 
          ? 'You have enabled access to your health records. The AI can now provide more personalized responses based on your medical history.'
          : 'You have disabled access to your health records. The AI will no longer use your medical history in responses.',
        timestamp: new Date().toISOString(),
        isSystem: true
      }]);
    } catch (err) {
      console.error('Error updating EHR consent:', err);
      setError('Failed to update health record consent. Please try again.');
    }
  };
  
  // Render urgency badge for triage results
  const renderUrgencyBadge = (triageResult) => {
    if (!triageResult) return null;
    
    const urgencyColors = {
      emergency: 'error',
      urgent: 'warning',
      prompt: 'info',
      routine: 'success'
    };
    
    return (
      <Chip 
        size="small"
        color={urgencyColors[triageResult.urgencyLevel] || 'default'}
        label={triageResult.urgencyLevel.toUpperCase()}
        icon={<MedicalIcon />}
        sx={{ ml: 1 }}
      />
    );
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <HealthIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Healthcare Assistant
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Tooltip title={`${voiceEnabled ? 'Disable' : 'Enable'} voice responses`}>
            <FormControlLabel
              control={
                <Switch 
                  checked={voiceEnabled}
                  onChange={() => setVoiceEnabled(!voiceEnabled)}
                  color="primary"
                  size="small"
                />
              }
              label={voiceEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              labelPlacement="start"
            />
          </Tooltip>
          
          <Tooltip title={`${ehrConsent ? 'Disable' : 'Enable'} health record access`}>
            <FormControlLabel
              control={
                <Switch 
                  checked={ehrConsent}
                  onChange={handleToggleEhrConsent}
                  color="secondary"
                  size="small"
                />
              }
              label={<HospitalIcon />}
              labelPlacement="start"
            />
          </Tooltip>
        </Stack>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Messages display */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2,
        mb: 2,
        p: 1
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary'
          }}>
            <MedicalIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
            <Typography variant="body1">
              How can I assist with your healthcare needs today?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You can ask about symptoms, medications, or general health questions.
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <Box 
              key={index} 
              sx={{
                display: 'flex',
                flexDirection: msg.isAI ? 'row' : 'row-reverse',
                gap: 1,
                maxWidth: '80%',
                alignSelf: msg.isAI ? 'flex-start' : 'flex-end',
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: msg.isAI 
                    ? (msg.isWarning ? 'warning.main' : (msg.isSystem ? 'info.main' : 'secondary.main')) 
                    : 'primary.main',
                  width: 36, 
                  height: 36 
                }}
              >
                {msg.isAI ? (msg.isWarning ? '⚠️' : (msg.isSystem ? 'i' : 'AI')) : user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    bgcolor: msg.isAI 
                      ? (msg.isWarning ? 'warning.light' : (msg.isSystem ? 'info.light' : 'secondary.light')) 
                      : 'primary.light',
                    color: 'white',
                    borderRadius: 2,
                    position: 'relative'
                  }}
                >
                  <Typography variant="body1">
                    {msg.content}
                  </Typography>
                  
                  {/* Show triage urgency if available */}
                  {msg.isAI && msg.triageResult && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      {renderUrgencyBadge(msg.triageResult)}
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {msg.triageResult.careRecommendation}
                      </Typography>
                    </Box>
                  )}
                </Paper>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {msg.isAI 
                      ? (msg.isWarning ? 'System Alert' : (msg.isSystem ? 'System' : 'AI Assistant')) 
                      : (msg.isVoice ? 'Voice Message' : 'You')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                  
                  {/* Voice indicator */}
                  {msg.isAI && msg.voiceResponse && voiceEnabled && (
                    <Tooltip title="Voice response available">
                      <VolumeUpIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Input area */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Type your healthcare question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading || isRecording}
          variant="outlined"
          size="medium"
        />
        
        <Tooltip title={isRecording ? 'Stop recording' : 'Record voice message'}>
          <IconButton 
            color={isRecording ? 'error' : 'primary'}
            onClick={toggleRecording}
            disabled={loading}
          >
            {isRecording ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>
        
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
          disabled={!message.trim() || loading || isRecording}
        >
          {loading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
    </Paper>
  );
};

export default EnhancedAIChat;