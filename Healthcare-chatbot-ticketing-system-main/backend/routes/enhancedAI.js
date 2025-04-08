/**
 * Enhanced AI Routes for TicketHub Healthcare Chatbot
 * 
 * This file contains API routes for the enhanced AI features including:
 * - HIPAA compliance checking
 * - Voice interface endpoints
 * - EHR data integration
 * - Medical triage processing
 * - Doctor recommendations
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const multer = require('multer'); // For handling multipart/form-data (audio files)
const upload = multer({ storage: multer.memoryStorage() });

// Import enhanced AI services
const {
  hipaaComplianceCheck,
  redactPHI,
  processVoiceInput,
  generateVoiceResponse,
  retrieveEHRData,
  enhanceResponseWithEHRContext,
  performSymptomTriage,
  recommendProviders,
  generateEnhancedAIResponse
} = require('../services/enhancedAIService');

// Import feature configuration
const featureConfig = require('../config/enhancedFeatures');

// @route   POST /api/enhanced-ai/analyze
// @desc    Analyze a message with all enhanced features
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  try {
    const { message, category, ticketId } = req.body;
    
    if (!message) {
      return res.status(400).json({ msg: 'Message is required' });
    }
    
    // Get user preferences
    const user = await User.findById(req.user.id);
    const preferredLanguage = user.preferredLanguage || 'en';
    
    // Options for enhanced response
    const options = {
      preferredLanguage,
      voiceOutput: featureConfig.voiceInterface.enabled && featureConfig.voiceInterface.outputEnabled,
      voiceGender: user.voicePreference || featureConfig.voiceInterface.defaultVoiceGender
    };
    
    // Add EHR data if integration is enabled and user has consented
    if (featureConfig.ehrIntegration.enabled && user.ehrConsent) {
      // In a real implementation, this would retrieve the actual patient ID
      const patientId = user.ehrPatientId || user.id;
      options.ehrData = await retrieveEHRData(patientId, featureConfig.ehrIntegration.dataTypes);
    }
    
    // Generate enhanced response
    const enhancedResponse = await generateEnhancedAIResponse(
      message,
      category,
      req.user.id,
      options
    );
    
    // If this is associated with a ticket, update the ticket with triage info
    if (ticketId && featureConfig.triageSystem.enabled && featureConfig.triageSystem.autoPrioritize) {
      const ticket = await Ticket.findById(ticketId);
      
      if (ticket) {
        // Update ticket priority based on triage urgency
        if (enhancedResponse.triageResult.urgencyLevel === 'emergency') {
          ticket.priority = 'urgent';
        } else if (enhancedResponse.triageResult.urgencyLevel === 'urgent') {
          ticket.priority = 'high';
        }
        
        // Flag for human review if needed
        if (enhancedResponse.requiresHumanReview) {
          // Add a note to the ticket
          ticket.messages.push({
            isAI: true,
            content: '[SYSTEM] This message has been flagged for human review due to detected urgency or PHI.',
            timestamp: Date.now()
          });
        }
        
        await ticket.save();
      }
    }
    
    res.json(enhancedResponse);
  } catch (err) {
    console.error('Error in enhanced AI analysis:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/enhanced-ai/voice
// @desc    Process voice input and return AI response
// @access  Private
router.post('/voice', [auth, upload.single('audio')], async (req, res) => {
  // Check if voice interface is enabled
  if (!featureConfig.voiceInterface.enabled || !featureConfig.voiceInterface.inputEnabled) {
    return res.status(403).json({ msg: 'Voice interface is not enabled' });
  }
  
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ msg: 'Audio file is required' });
    }
    
    // Process voice input
    const transcriptionResult = await processVoiceInput(req.file.buffer);
    
    // Get category from request body
    const { category, ticketId } = req.body;
    
    // Get user preferences
    const user = await User.findById(req.user.id);
    const preferredLanguage = user.preferredLanguage || transcriptionResult.languageDetected || 'en';
    
    // Options for enhanced response
    const options = {
      preferredLanguage,
      voiceOutput: true, // Always enable voice output for voice input
      voiceGender: user.voicePreference || featureConfig.voiceInterface.defaultVoiceGender
    };
    
    // Add EHR data if integration is enabled and user has consented
    if (featureConfig.ehrIntegration.enabled && user.ehrConsent) {
      const patientId = user.ehrPatientId || user.id;
      options.ehrData = await retrieveEHRData(patientId, featureConfig.ehrIntegration.dataTypes);
    }
    
    // Generate enhanced response
    const enhancedResponse = await generateEnhancedAIResponse(
      transcriptionResult.transcribedText,
      category,
      req.user.id,
      options
    );
    
    // If this is associated with a ticket, add the transcribed message and AI response
    if (ticketId) {
      const ticket = await Ticket.findById(ticketId);
      
      if (ticket) {
        // Add user's transcribed message
        ticket.messages.push({
          sender: req.user.id,
          content: transcriptionResult.transcribedText,
          isAI: false,
          timestamp: Date.now()
        });
        
        // Add AI response
        ticket.messages.push({
          isAI: true,
          content: enhancedResponse.textResponse,
          timestamp: Date.now()
        });
        
        // Update ticket priority if triage system is enabled
        if (featureConfig.triageSystem.enabled && featureConfig.triageSystem.autoPrioritize) {
          if (enhancedResponse.triageResult.urgencyLevel === 'emergency') {
            ticket.priority = 'urgent';
          } else if (enhancedResponse.triageResult.urgencyLevel === 'urgent') {
            ticket.priority = 'high';
          }
        }
        
        await ticket.save();
      }
    }
    
    res.json({
      transcription: transcriptionResult,
      response: enhancedResponse
    });
  } catch (err) {
    console.error('Error processing voice input:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/enhanced-ai/hipaa-check
// @desc    Check a message for HIPAA compliance
// @access  Private
router.post('/hipaa-check', auth, async (req, res) => {
  // Check if HIPAA compliance feature is enabled
  if (!featureConfig.hipaaCompliance.enabled) {
    return res.status(403).json({ msg: 'HIPAA compliance checking is not enabled' });
  }
  
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ msg: 'Message is required' });
    }
    
    // Check message for PHI
    const complianceCheck = hipaaComplianceCheck(message);
    
    // If auto-redaction is enabled, include redacted version
    let redactedMessage = null;
    if (featureConfig.hipaaCompliance.autoRedactPHI && complianceCheck.containsPHI) {
      redactedMessage = redactPHI(message);
    }
    
    res.json({
      ...complianceCheck,
      redactedMessage
    });
  } catch (err) {
    console.error('Error checking HIPAA compliance:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/enhanced-ai/triage
// @desc    Perform medical triage on a message
// @access  Private
router.post('/triage', auth, async (req, res) => {
  // Check if triage system is enabled
  if (!featureConfig.triageSystem.enabled) {
    return res.status(403).json({ msg: 'Medical triage system is not enabled' });
  }
  
  try {
    const { message, ticketId } = req.body;
    
    if (!message) {
      return res.status(400).json({ msg: 'Message is required' });
    }
    
    // Perform triage
    const triageResult = performSymptomTriage(message);
    
    // If this is associated with a ticket and auto-prioritize is enabled, update the ticket
    if (ticketId && featureConfig.triageSystem.autoPrioritize) {
      const ticket = await Ticket.findById(ticketId);
      
      if (ticket) {
        // Update ticket priority based on triage urgency
        if (triageResult.urgencyLevel === 'emergency') {
          ticket.priority = 'urgent';
          
          // If escalation is enabled, notify providers
          if (featureConfig.triageSystem.escalateEmergencies) {
            // In a real implementation, this would send notifications to providers
            console.log(`EMERGENCY ESCALATION for ticket ${ticketId}: ${message}`);
          }
        } else if (triageResult.urgencyLevel === 'urgent') {
          ticket.priority = 'high';
          
          // If provider notification is enabled for urgent cases
          if (featureConfig.triageSystem.notifyProvidersOnUrgent) {
            // In a real implementation, this would send notifications to providers
            console.log(`URGENT NOTIFICATION for ticket ${ticketId}: ${message}`);
          }
        } else if (triageResult.urgencyLevel === 'prompt') {
          ticket.priority = 'medium';
        }
        
        await ticket.save();
      }
    }
    
    res.json(triageResult);
  } catch (err) {
    console.error('Error performing medical triage:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/enhanced-ai/recommend-providers
// @desc    Get provider recommendations based on symptoms
// @access  Private
router.post('/recommend-providers', auth, async (req, res) => {
  // Check if doctor recommendation feature is enabled
  if (!featureConfig.doctorRecommendation.enabled) {
    return res.status(403).json({ msg: 'Doctor recommendation feature is not enabled' });
  }
  
  try {
    const { message, symptoms, location } = req.body;
    
    if (!message && (!symptoms || !symptoms.length)) {
      return res.status(400).json({ msg: 'Either message or symptoms array is required' });
    }
    
    // Get recommendations
    const recommendations = recommendProviders(
      message || '',
      symptoms || [],
      location || null
    );
    
    // Limit number of recommendations if configured
    if (featureConfig.doctorRecommendation.maxRecommendations > 0) {
      recommendations.recommendedSpecialties = 
        recommendations.recommendedSpecialties.slice(0, featureConfig.doctorRecommendation.maxRecommendations);
      
      recommendations.providerTypes = 
        recommendations.providerTypes.slice(0, featureConfig.doctorRecommendation.maxRecommendations);
    }
    
    // Filter out specialties or provider types if not enabled
    if (!featureConfig.doctorRecommendation.includeSpecialties) {
      delete recommendations.recommendedSpecialties;
    }
    
    if (!featureConfig.doctorRecommendation.includeProviderTypes) {
      delete recommendations.providerTypes;
    }
    
    res.json(recommendations);
  } catch (err) {
    console.error('Error generating provider recommendations:', err);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/enhanced-ai/ehr-consent
// @desc    Update user's consent for EHR data access
// @access  Private
router.post('/ehr-consent', auth, async (req, res) => {
  // Check if EHR integration is enabled
  if (!featureConfig.ehrIntegration.enabled) {
    return res.status(403).json({ msg: 'EHR integration is not enabled' });
  }
  
  try {
    const { consent, patientId } = req.body;
    
    // Update user's EHR consent and patient ID
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.ehrConsent = consent;
    if (patientId) {
      user.ehrPatientId = patientId;
    }
    
    await user.save();
    
    res.json({ msg: 'EHR consent updated successfully', ehrConsent: user.ehrConsent });
  } catch (err) {
    console.error('Error updating EHR consent:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;