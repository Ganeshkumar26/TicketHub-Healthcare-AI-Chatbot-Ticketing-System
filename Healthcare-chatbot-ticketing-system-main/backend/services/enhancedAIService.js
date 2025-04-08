/**
 * Enhanced AI Service Extensions for TicketHub Healthcare Chatbot
 * 
 * This service extends the existing AI capabilities with advanced healthcare-specific features:
 * - HIPAA Compliance Layer
 * - Voice Interface Support
 * - EHR Integration Framework
 * - Medical Triage System
 * - Doctor Recommendation Engine
 */

const natural = require('natural');
const { generateAIResponse, analyzeMessage } = require('./aiService');

// HIPAA Compliance Layer
// ---------------------

/**
 * HIPAA compliance checker that scans messages for PHI (Protected Health Information)
 * and ensures proper handling of sensitive data
 * @param {string} message - The message to check for PHI
 * @returns {Object} Analysis results including PHI detection and compliance recommendations
 */
const hipaaComplianceCheck = (message) => {
  // PHI identifiers as defined by HIPAA
  const phiPatterns = {
    names: /\b(?:[A-Z][a-z]+ ){1,2}[A-Z][a-z]+\b/,
    phoneNumbers: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
    emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    ssn: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/,
    medicalRecordNumbers: /\b(?:MRN|Medical Record)\s*#?\s*\d+\b/i,
    addresses: /\b\d+\s+[A-Za-z0-9\s,]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Ln|Rd|Blvd|Dr|St)\.?\s+(?:Apt|Unit|Suite)?\s*\d*\b/i,
    dates: /\b(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/
  };
  
  // Check for PHI in message
  const detectedPHI = {};
  let containsPHI = false;
  
  Object.entries(phiPatterns).forEach(([type, pattern]) => {
    const matches = message.match(pattern);
    if (matches) {
      detectedPHI[type] = matches.length;
      containsPHI = true;
    }
  });
  
  return {
    containsPHI,
    detectedPHI,
    complianceRecommendations: containsPHI ? [
      "Detected potential PHI in message. Consider redacting or encrypting this information.",
      "Ensure proper authorization before storing or transmitting this information.",
      "Document the purpose for which this PHI is being collected."
    ] : [],
    safeToStore: !containsPHI
  };
};

/**
 * Redacts PHI from messages for safer storage and display
 * @param {string} message - The message containing potential PHI
 * @returns {string} Redacted message with PHI replaced by generic placeholders
 */
const redactPHI = (message) => {
  // Replace potential PHI with generic placeholders
  let redactedMessage = message;
  
  // Redact patterns
  redactedMessage = redactedMessage.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE NUMBER]');
  redactedMessage = redactedMessage.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL]');
  redactedMessage = redactedMessage.replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, '[SSN]');
  redactedMessage = redactedMessage.replace(/\b(?:MRN|Medical Record)\s*#?\s*\d+\b/gi, '[MEDICAL RECORD NUMBER]');
  redactedMessage = redactedMessage.replace(/\b\d+\s+[A-Za-z0-9\s,]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Ln|Rd|Blvd|Dr|St)\.?\s+(?:Apt|Unit|Suite)?\s*\d*\b/gi, '[ADDRESS]');
  
  return redactedMessage;
};

// Voice Interface Support
// ---------------------

/**
 * Processes voice input for the chatbot
 * In a production environment, this would connect to a speech-to-text service
 * @param {Buffer} audioData - Raw audio data from the client
 * @returns {Object} The transcribed text and confidence score
 */
const processVoiceInput = async (audioData) => {
  // This is a placeholder for actual speech-to-text processing
  // In production, you would use a service like Google Speech-to-Text, Amazon Transcribe, etc.
  
  console.log('Processing voice input of size:', audioData.length);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock result
  return {
    transcribedText: "This is a simulated transcription. In production, this would be the actual transcribed text from the audio.",
    confidenceScore: 0.95,
    languageDetected: 'en'
  };
};

/**
 * Converts text response to speech for voice output
 * In a production environment, this would connect to a text-to-speech service
 * @param {string} text - The text to convert to speech
 * @param {string} language - The language code
 * @param {string} voiceGender - Preferred voice gender (male/female)
 * @returns {Object} Audio data and format information
 */
const generateVoiceResponse = async (text, language = 'en', voiceGender = 'female') => {
  // This is a placeholder for actual text-to-speech processing
  // In production, you would use a service like Google Text-to-Speech, Amazon Polly, etc.
  
  console.log(`Generating voice response for text (${text.length} chars) in ${language}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock result
  return {
    audioData: Buffer.from('Simulated audio data'),
    format: 'audio/mp3',
    duration: text.length / 15, // Rough estimate of audio duration in seconds
    message: "In production, this would return actual audio data for playback"
  };
};

// EHR Integration Framework
// -----------------------

/**
 * Securely connects to Electronic Health Record systems to retrieve relevant patient context
 * This is a framework for integration - actual implementation would require specific EHR API credentials
 * @param {string} patientId - The patient identifier in the EHR system
 * @param {Array} dataTypes - Types of data to retrieve (e.g., medications, allergies, conditions)
 * @returns {Object} Relevant patient data from the EHR
 */
const retrieveEHRData = async (patientId, dataTypes = ['medications', 'allergies', 'conditions']) => {
  // This is a placeholder for actual EHR integration
  // In production, this would connect to EHR systems like Epic, Cerner, etc. using FHIR or other standards
  
  console.log(`Retrieving ${dataTypes.join(', ')} for patient ${patientId}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Return mock data
  return {
    patientSummary: {
      medications: [
        { name: "Simulated Medication 1", dosage: "10mg", frequency: "daily" },
        { name: "Simulated Medication 2", dosage: "20mg", frequency: "twice daily" }
      ],
      allergies: [
        { substance: "Simulated Allergen 1", severity: "moderate", reaction: "rash" },
        { substance: "Simulated Allergen 2", severity: "severe", reaction: "anaphylaxis" }
      ],
      conditions: [
        { name: "Simulated Condition 1", status: "active", diagnosedDate: "2022-01-15" },
        { name: "Simulated Condition 2", status: "resolved", diagnosedDate: "2021-05-22" }
      ]
    },
    message: "In production, this would return actual patient data from the connected EHR system"
  };
};

/**
 * Enhances AI responses with context from EHR data
 * @param {string} baseResponse - The initial AI response
 * @param {Object} ehrData - Patient data retrieved from EHR
 * @returns {string} Enhanced response with relevant EHR context
 */
const enhanceResponseWithEHRContext = (baseResponse, ehrData) => {
  if (!ehrData || !ehrData.patientSummary) {
    return baseResponse;
  }
  
  // Add relevant EHR context to the response
  let enhancedResponse = baseResponse;
  
  // Add medication context if relevant
  if (baseResponse.toLowerCase().includes('medication') && ehrData.patientSummary.medications?.length > 0) {
    enhancedResponse += "\n\nBased on your records, I can see you're currently taking: ";
    ehrData.patientSummary.medications.forEach(med => {
      enhancedResponse += `\n- ${med.name} (${med.dosage}, ${med.frequency})`;
    });
  }
  
  // Add allergy context if relevant
  if (baseResponse.toLowerCase().includes('allerg') && ehrData.patientSummary.allergies?.length > 0) {
    enhancedResponse += "\n\nI notice from your records that you have the following allergies: ";
    ehrData.patientSummary.allergies.forEach(allergy => {
      enhancedResponse += `\n- ${allergy.substance} (${allergy.severity} - ${allergy.reaction})`;
    });
  }
  
  // Add condition context if relevant
  if (ehrData.patientSummary.conditions?.length > 0) {
    const activeConditions = ehrData.patientSummary.conditions.filter(c => c.status === 'active');
    if (activeConditions.length > 0) {
      enhancedResponse += "\n\nI'm taking into account your current health conditions in this response.";
    }
  }
  
  return enhancedResponse;
};

// Medical Triage System
// -------------------

/**
 * Analyzes symptoms to determine urgency level and appropriate care pathway
 * @param {string} message - The user's message describing symptoms
 * @returns {Object} Triage assessment including urgency level and recommendations
 */
const performSymptomTriage = (message) => {
  // First use the existing NLP analysis
  const analysis = analyzeMessage(message);
  
  // Emergency symptoms requiring immediate attention
  const emergencySymptoms = [
    'chest pain', 'severe bleeding', 'shortness of breath', 'difficulty breathing',
    'stroke', 'unconscious', 'unresponsive', 'seizure', 'severe head injury',
    'suicidal', 'overdose', 'poisoning', 'anaphylaxis', 'severe allergic'
  ];
  
  // Urgent symptoms requiring prompt but not emergency care
  const urgentSymptoms = [
    'fever', 'vomiting', 'dehydration', 'infection', 'broken bone', 'fracture',
    'sprain', 'moderate pain', 'minor burn', 'cut requiring stitches',
    'severe sore throat', 'severe headache', 'abdominal pain'
  ];
  
  // Check for emergency symptoms
  const hasEmergencySymptoms = emergencySymptoms.some(symptom => 
    message.toLowerCase().includes(symptom)
  );
  
  // Check for urgent symptoms
  const hasUrgentSymptoms = urgentSymptoms.some(symptom => 
    message.toLowerCase().includes(symptom)
  );
  
  // Determine urgency level
  let urgencyLevel = 'routine';
  let careRecommendation = 'Schedule a regular appointment with your healthcare provider.';
  let timeframe = 'within the next few days';
  
  if (hasEmergencySymptoms) {
    urgencyLevel = 'emergency';
    careRecommendation = 'Please call 911 or go to the nearest emergency room immediately.';
    timeframe = 'immediately';
  } else if (hasUrgentSymptoms || analysis.sentiment.isUrgent) {
    urgencyLevel = 'urgent';
    careRecommendation = 'Please seek urgent care or contact your doctor today.';
    timeframe = 'today';
  } else if (analysis.sentiment.score < -0.3) {
    urgencyLevel = 'prompt';
    careRecommendation = 'Schedule an appointment soon with your healthcare provider.';
    timeframe = 'within 1-2 days';
  }
  
  return {
    urgencyLevel,
    careRecommendation,
    timeframe,
    detectedSymptoms: analysis.entities.symptoms,
    sentiment: analysis.sentiment,
    requiresHumanReview: urgencyLevel !== 'routine'
  };
};

// Doctor Recommendation Engine
// --------------------------

/**
 * Recommends appropriate healthcare providers based on symptoms and conditions
 * @param {string} message - The user's message
 * @param {Array} symptoms - Detected symptoms
 * @param {string} location - User's location (optional)
 * @returns {Object} Recommended provider types and specialties
 */
const recommendProviders = (message, symptoms, location = null) => {
  // Map of symptoms/conditions to medical specialties
  const specialtyMap = {
    // Cardiovascular
    'chest pain': 'Cardiology',
    'heart': 'Cardiology',
    'blood pressure': 'Cardiology',
    'palpitations': 'Cardiology',
    
    // Respiratory
    'breathing': 'Pulmonology',
    'lung': 'Pulmonology',
    'cough': 'Pulmonology',
    'asthma': 'Pulmonology',
    
    // Digestive
    'stomach': 'Gastroenterology',
    'digestion': 'Gastroenterology',
    'bowel': 'Gastroenterology',
    'nausea': 'Gastroenterology',
    'vomit': 'Gastroenterology',
    
    // Neurological
    'headache': 'Neurology',
    'migraine': 'Neurology',
    'dizz': 'Neurology',
    'numbness': 'Neurology',
    'seizure': 'Neurology',
    
    // Musculoskeletal
    'joint': 'Orthopedics',
    'bone': 'Orthopedics',
    'muscle': 'Orthopedics',
    'back pain': 'Orthopedics',
    'arthritis': 'Rheumatology',
    
    // Skin
    'rash': 'Dermatology',
    'skin': 'Dermatology',
    'itch': 'Dermatology',
    'acne': 'Dermatology',
    
    // Mental health
    'anxiety': 'Psychiatry',
    'depression': 'Psychiatry',
    'stress': 'Psychiatry',
    'mood': 'Psychiatry',
    'sleep': 'Sleep Medicine',
    
    // General
    'fever': 'Primary Care',
    'cold': 'Primary Care',
    'flu': 'Primary Care',
    'vaccination': 'Primary Care',
    'check up': 'Primary Care'
  };
  
  // Identify relevant specialties based on message content
  const relevantSpecialties = new Set();
  
  // Check message for specialty keywords
  Object.entries(specialtyMap).forEach(([keyword, specialty]) => {
    if (message.toLowerCase().includes(keyword)) {
      relevantSpecialties.add(specialty);
    }
  });
  
  // Check symptoms for specialty matches
  if (symptoms && symptoms.length > 0) {
    symptoms.forEach(symptom => {
      Object.entries(specialtyMap).forEach(([keyword, specialty]) => {
        if (symptom.toLowerCase().includes(keyword)) {
          relevantSpecialties.add(specialty);
        }
      });
    });
  }
  
  // Default to primary care if no specialties matched
  if (relevantSpecialties.size === 0) {
    relevantSpecialties.add('Primary Care');
  }
  
  return {
    recommendedSpecialties: Array.from(relevantSpecialties),
    providerTypes: determineProviderTypes(relevantSpecialties),
    locationBased: location ? `Providers near ${location}` : null,
    message: "These recommendations are based on your symptoms and should be confirmed by a healthcare professional."
  };
};

/**
 * Determines appropriate provider types based on specialties
 * @param {Set} specialties - Set of medical specialties
 * @returns {Array} Appropriate provider types
 */
const determineProviderTypes = (specialties) => {
  const specialtiesArray = Array.from(specialties);
  const providerTypes = [];
  
  // Map specialties to provider types
  if (specialtiesArray.includes('Primary Care')) {
    providerTypes.push('Family Medicine Physician', 'Internal Medicine Physician', 'Nurse Practitioner');
  }
  
  if (specialtiesArray.includes('Psychiatry') || specialtiesArray.includes('Psychology')) {
    providerTypes.push('Psychiatrist', 'Psychologist', 'Licensed Clinical Social Worker');
  }
  
  // Add specialists based on detected specialties
  specialtiesArray.forEach(specialty => {
    if (specialty !== 'Primary Care' && specialty !== 'Psychiatry' && specialty !== 'Psychology') {
      providerTypes.push(`${specialty} Specialist`);
    }
  });
  
  return providerTypes;
};

/**
 * Enhanced AI response generator that incorporates all advanced features
 * @param {string} message - The user's message
 * @param {string} category - The ticket category
 * @param {string} userId - The user's ID for context tracking
 * @param {Object} options - Additional options including EHR data, voice preferences, etc.
 * @returns {Object} Enhanced AI response with additional context and recommendations
 */
const generateEnhancedAIResponse = async (message, category, userId, options = {}) => {
  // Check HIPAA compliance
  const complianceCheck = hipaaComplianceCheck(message);
  
  // Perform medical triage
  const triageResult = performSymptomTriage(message);
  
  // Get base AI response from existing service
  const baseResponse = await generateAIResponse(message, category, userId, options.preferredLanguage);
  
  // Enhance with EHR data if available
  let enhancedResponse = baseResponse;
  if (options.ehrData) {
    enhancedResponse = enhanceResponseWithEHRContext(baseResponse, options.ehrData);
  }
  
  // Add provider recommendations if symptoms detected
  const analysis = analyzeMessage(message);
  if (analysis.entities.symptoms.length > 0) {
    const providerRecommendations = recommendProviders(message, analysis.entities.symptoms, options.location);
    
    if (providerRecommendations.recommendedSpecialties.length > 0) {
      enhancedResponse += "\n\nBased on your symptoms, you might consider consulting with: ";
      providerRecommendations.recommendedSpecialties.forEach(specialty => {
        enhancedResponse += `\n- ${specialty}`;
      });
    }
  }
  
  // Add urgency information for non-routine cases
  if (triageResult.urgencyLevel !== 'routine') {
    enhancedResponse = `[${triageResult.urgencyLevel.toUpperCase()}] ${triageResult.careRecommendation}\n\n${enhancedResponse}`;
  }
  
  // Generate voice response if requested
  let voiceResponse = null;
  if (options.voiceOutput) {
    voiceResponse = await generateVoiceResponse(
      enhancedResponse, 
      options.preferredLanguage || 'en',
      options.voiceGender || 'female'
    );
  }
  
  return {
    textResponse: enhancedResponse,
    voiceResponse,
    complianceCheck,
    triageResult,
    requiresHumanReview: triageResult.requiresHumanReview || complianceCheck.containsPHI,
    redactedMessage: complianceCheck.containsPHI ? redactPHI(message) : message
  };
};

module.exports = {
  hipaaComplianceCheck,
  redactPHI,
  processVoiceInput,
  generateVoiceResponse,
  retrieveEHRData,
  enhanceResponseWithEHRContext,
  performSymptomTriage,
  recommendProviders,
  generateEnhancedAIResponse
};