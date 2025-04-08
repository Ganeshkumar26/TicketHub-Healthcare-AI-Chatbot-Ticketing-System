/**
 * Configuration for Enhanced AI Features
 * 
 * This file controls which enhanced AI features are enabled in the system.
 * Modify these settings to gradually roll out new capabilities.
 */

module.exports = {
  // HIPAA Compliance Layer
  hipaaCompliance: {
    enabled: true,
    autoRedactPHI: true,
    storeComplianceMetadata: true,
    notifyOnPHIDetection: true
  },
  
  // Voice Interface
  voiceInterface: {
    enabled: true,
    inputEnabled: true,
    outputEnabled: true,
    defaultVoiceGender: 'female',
    maxAudioDuration: 60 // seconds
  },
  
  // EHR Integration
  ehrIntegration: {
    enabled: true,
    requireExplicitConsent: true,
    dataTypes: ['medications', 'allergies', 'conditions'],
    refreshInterval: 24 // hours
  },
  
  // Medical Triage System
  triageSystem: {
    enabled: true,
    autoPrioritize: true,
    escalateEmergencies: true,
    notifyProvidersOnUrgent: true
  },
  
  // Doctor Recommendation
  doctorRecommendation: {
    enabled: true,
    includeSpecialties: true,
    includeProviderTypes: true,
    maxRecommendations: 3
  },
  
  // Global Settings
  global: {
    debugMode: false,
    logEnhancedResponses: true,
    requireAuthForEnhancedFeatures: true
  }
};