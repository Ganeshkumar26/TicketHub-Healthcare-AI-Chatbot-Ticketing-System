/*
 * Enhanced AI Service for TicketHub with NLP capabilities
 * 
 * This service provides natural language processing for the healthcare chatbot.
 * It uses the 'natural' library for NLP features like tokenization, stemming,
 * classification, and sentiment analysis to better understand and respond to patient inquiries.
 * 
 * Features:
 * - Intent classification
 * - Entity recognition
 * - Sentiment analysis
 * - Conversation context management
 * - Multi-language support
 * - Feedback learning system
 */

const natural = require('natural');

// Import language service for multi-language support
const languageService = require('./languageService');

// Initialize NLP components
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const classifier = new natural.BayesClassifier();
const Analyzer = natural.SentimentAnalyzer;
const sentimentAnalyzer = new Analyzer("English", stemmer, "afinn");

// Import training data from separate file for better organization
const trainingData = require('./trainingData');

// Train the classifier with our data
trainingData.forEach(item => {
  classifier.addDocument(item.text, item.category);
});

// Train the model
classifier.train();

// Context management for conversations
const conversationContexts = new Map();

/**
 * Analyzes the message content to determine intent, extract entities, and assess sentiment
 * @param {string} message - The user's message
 * @returns {Object} Analysis results including intent, entities, and sentiment
 */
const analyzeMessage = (message) => {
  // Tokenize the message
  const tokens = tokenizer.tokenize(message.toLowerCase());
  
  // Stem the tokens for better matching
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  
  // Classify the message to determine intent
  const classification = classifier.classify(message);
  
  // Analyze sentiment (positive, negative, neutral)
  const sentimentScore = sentimentAnalyzer.getSentiment(tokens);
  let sentiment = "neutral";
  if (sentimentScore > 0.2) sentiment = "positive";
  else if (sentimentScore < -0.2) sentiment = "negative";
  
  // Determine urgency based on sentiment and specific urgent terms
  const urgentTerms = ["emergency", "urgent", "immediately", "severe", "critical", "help", "now", "asap"];
  const hasUrgentTerms = tokens.some(token => urgentTerms.includes(token));
  const isUrgent = (sentiment === "negative" && sentimentScore < -0.5) || hasUrgentTerms;
  
  // Enhanced entity recognition for medical terms
  const entities = {
    dates: tokens.filter(token => /\b\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?\b/.test(token)),
    medications: tokens.filter(token => /\b(pill|medication|medicine|prescription|drug|dose|tablet|capsule|antibiotic|inhaler|insulin|injection)s?\b/i.test(token)),
    symptoms: tokens.filter(token => /\b(pain|ache|fever|cough|headache|nausea|dizz|swelling|rash|fatigue|tired|exhausted|vomit|diarrhea|constipation|bleed|breath|numb|itch|burn|sore)\w*\b/i.test(token)),
    medicalConditions: tokens.filter(token => /\b(diabet|hypertension|asthma|arthritis|depression|anxiety|allerg|cancer|heart|stroke|infection|disease|disorder|syndrome)\w*\b/i.test(token)),
    bodyParts: tokens.filter(token => /\b(head|chest|arm|leg|foot|hand|back|neck|shoulder|knee|ankle|wrist|stomach|throat|ear|eye|nose|skin|heart|lung|liver|kidney)s?\b/i.test(token))
  };
  
  return {
    intent: classification,
    entities,
    tokens,
    stemmedTokens,
    sentiment: {
      score: sentimentScore,
      label: sentiment,
      isUrgent
    }
  };
};

/**
 * Updates or creates a conversation context for a user
 * @param {string} userId - The user's ID
 * @param {Object} context - Context information to store
 */
const updateConversationContext = (userId, context) => {
  if (!conversationContexts.has(userId)) {
    conversationContexts.set(userId, { history: [] });
  }
  
  const userContext = conversationContexts.get(userId);
  userContext.history.push(context);
  
  // Limit history size to prevent memory issues
  if (userContext.history.length > 10) {
    userContext.history.shift();
  }
  
  // Update last interaction time
  userContext.lastInteraction = Date.now();
};

/**
 * Generates a response based on the analysis of the user's message
 * @param {string} message - The user's message
 * @param {string} category - The ticket category
 * @param {string} userId - The user's ID for context tracking
 * @param {string} preferredLanguage - The user's preferred language (optional)
 * @returns {string} The AI response
 */
const generateAIResponse = async (message, category, userId = null, preferredLanguage = null) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Detect message language if preferred language not specified
  const detectedLanguage = languageService.detectLanguage(message);
  const userLanguage = preferredLanguage || detectedLanguage;
  
  // Store the detected language for future interactions
  const isEnglish = userLanguage === 'en';
  
  // If not English, we need to translate for our English-trained model
  let processMessage = message;
  if (!isEnglish) {
    // In a production system, translate to English for processing
    // For now, we'll use the original message but note that translation would happen here
    console.log(`Detected non-English language: ${userLanguage}`);
  }
  
  // Analyze the message
  const analysis = analyzeMessage(processMessage);
  
  // Update conversation context if userId is provided
  if (userId) {
    updateConversationContext(userId, {
      message,
      analysis,
      language: userLanguage,
      timestamp: Date.now()
    });
  }
  
  // Use the detected intent if available, otherwise fall back to the ticket category
  const responseCategory = analysis.intent || category;
  
  // Check if this is an urgent message based on sentiment analysis
  const isUrgent = analysis.sentiment.isUrgent;
  const sentimentLabel = analysis.sentiment.label;
  
  // Prefix for urgent messages
  let urgentPrefix = "";
  if (isUrgent) {
    urgentPrefix = "I notice this seems urgent. I've flagged your message for priority review by our healthcare team. ";
  }
  
  // Enhanced response templates based on intent/category, entities, and sentiment
  const responses = {
    general: [
      `Thank you for your general healthcare inquiry. I understand you're asking about ${analysis.tokens.slice(0, 3).join(' ')}... A healthcare provider will review your case soon.`,
      `I've noted your question about general healthcare matters. While I can provide basic information, a human healthcare provider will follow up with more specific guidance about ${analysis.tokens.slice(0, 3).join(' ')}...`
    ],
    appointment: [
      `I see you have a question about appointments${analysis.entities.dates.length > 0 ? ` on ${analysis.entities.dates.join(', ')}` : ''}. I can help with basic scheduling information, but a staff member will need to confirm any changes to your appointments.`,
      `Thank you for your appointment-related query. I've logged this in our system, and a healthcare provider will assist you with scheduling${analysis.entities.dates.length > 0 ? ` for ${analysis.entities.dates.join(', ')}` : ''}.`
    ],
    prescription: [
      `I understand you have a question about your ${analysis.entities.medications.length > 0 ? analysis.entities.medications.join(', ') : 'prescription'}. For patient safety, a healthcare provider will need to review your medication request.`,
      `Thank you for your prescription inquiry. While I cannot provide medical advice, I've prioritized your request about ${analysis.entities.medications.length > 0 ? analysis.entities.medications.join(', ') : 'your medication'} for review by a qualified healthcare provider.`
    ],
    billing: [
      `I see your question is about billing. I've recorded your concern, and a billing specialist will review your account and respond shortly.`,
      `Thank you for your billing inquiry. Your financial questions are important to us, and a team member will address your concerns about ${analysis.tokens.slice(0, 3).join(' ')}... soon.`
    ],
    technical: [
      `I understand you're experiencing technical difficulties with ${analysis.tokens.slice(0, 3).join(' ')}... I've logged this issue, and our technical support team will help resolve it.`,
      `Thank you for reporting this technical issue. Our IT team will review your case about ${analysis.tokens.slice(0, 3).join(' ')}... and provide assistance shortly.`
    ],
    symptoms: [
      `I notice you mentioned ${analysis.entities.symptoms.join(', ')}. While I can't provide medical advice, a healthcare professional will review your symptoms and respond soon.`,
      `Thank you for sharing information about your ${analysis.entities.symptoms.join(', ')}. A qualified healthcare provider will assess this information and follow up with you shortly.`
    ],
    preventive: [
      `Thank you for your interest in preventive care. I've noted your question about ${analysis.tokens.slice(0, 3).join(' ')}... A healthcare provider will provide you with detailed preventive care information soon.`,
      `I appreciate your focus on preventive healthcare. Your question about ${analysis.tokens.slice(0, 3).join(' ')}... has been logged, and a healthcare professional will follow up with personalized guidance.`
    ],
    emergency: [
      `I understand you're asking about emergency care. If this is a medical emergency, please call 911 immediately. A healthcare provider will review your message as soon as possible.`,
      `For emergency situations, please call 911 or go to your nearest emergency room. I've flagged your message for urgent review by our healthcare team.`
    ],
    mental_health: [
      `Thank you for reaching out about mental health services. Your wellbeing is important to us, and a mental health professional will respond to your inquiry soon.`,
      `I appreciate you sharing your mental health concerns. A qualified mental health provider will review your message and follow up with support options shortly.`
    ],
    other: [
      `Thank you for your message. I've analyzed your request about ${analysis.tokens.slice(0, 3).join(' ')}... and a healthcare team member will respond to your specific needs soon.`,
      `I've received your inquiry. While I can help with basic information, a healthcare provider will follow up with personalized assistance regarding ${analysis.tokens.slice(0, 3).join(' ')}...`
    ]
  };
  
  // Add sentiment-specific responses
  if (sentimentLabel === "negative" && !isUrgent) {
    // For negative but not urgent messages, show empathy
    const empathyPhrases = [
      "I understand this may be frustrating. ",
      "I'm sorry to hear you're having difficulties. ",
      "I appreciate your patience with this matter. "
    ];
    const randomEmpathy = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    urgentPrefix = randomEmpathy;
  }
  
  // Check for medical conditions and add to response if present
  if (analysis.entities.medicalConditions.length > 0) {
    responses.medicalConditions = [
      `I see you've mentioned ${analysis.entities.medicalConditions.join(', ')}. A healthcare provider with expertise in this area will review your message and respond soon.`,
      `Thank you for providing information about ${analysis.entities.medicalConditions.join(', ')}. This helps us direct your inquiry to the appropriate healthcare specialist.`
    ];
  }
  
  // Select a response based on priority: emergency > symptoms > medical conditions > detected category
  let categoryResponses;
  if (responseCategory === "emergency" || isUrgent) {
    categoryResponses = responses.emergency || responses.other;
  } else if (analysis.entities.symptoms.length > 0) {
    categoryResponses = responses.symptoms;
  } else if (analysis.entities.medicalConditions.length > 0) {
    categoryResponses = responses.medicalConditions;
  } else {
    categoryResponses = responses[responseCategory] || responses.other;
  }
  
  // Select a random response from the appropriate category
  const randomIndex = Math.floor(Math.random() * categoryResponses.length);
  
  // Combine urgent prefix (if any) with the selected response
  const response = urgentPrefix + categoryResponses[randomIndex];
  
  // Translate response to user's language if not English
  if (userLanguage !== 'en') {
    return languageService.localizeResponse(response, userLanguage);
  }
  
  return response;
};

// Feedback collection and learning system
const feedbackStore = new Map();

/**
 * Records user feedback on AI responses to improve future responses
 * @param {string} userId - The user's ID
 * @param {string} messageId - The message ID that received feedback
 * @param {boolean} helpful - Whether the response was helpful
 * @param {string} feedbackText - Optional feedback text from user
 * @returns {boolean} Success status
 */
const recordFeedback = (userId, messageId, helpful, feedbackText = '') => {
  try {
    const feedbackKey = `${userId}:${messageId}`;
    feedbackStore.set(feedbackKey, {
      userId,
      messageId,
      helpful,
      feedbackText,
      timestamp: Date.now()
    });
    
    // In a production system, this would be stored in a database
    // and periodically analyzed to improve the model
    return true;
  } catch (error) {
    console.error('Error recording feedback:', error);
    return false;
  }
};

/**
 * Analyzes collected feedback to improve response quality
 * This would typically be run as a scheduled job in a production system
 */
const analyzeFeedback = () => {
  // This is a placeholder for a more sophisticated feedback analysis system
  // In a real implementation, this would use the feedback to retrain the model
  const feedbackCount = feedbackStore.size;
  const helpfulCount = Array.from(feedbackStore.values()).filter(f => f.helpful).length;
  const helpfulPercentage = feedbackCount > 0 ? (helpfulCount / feedbackCount) * 100 : 0;
  
  console.log(`Feedback analysis: ${helpfulCount}/${feedbackCount} helpful responses (${helpfulPercentage.toFixed(1)}%)`);
  
  // In a real system, this would trigger model retraining or parameter adjustments
  return {
    feedbackCount,
    helpfulCount,
    helpfulPercentage
  };
};

// Clean up old conversation contexts periodically
setInterval(() => {
  const now = Date.now();
  const expirationTime = 30 * 60 * 1000; // 30 minutes
  
  conversationContexts.forEach((context, userId) => {
    if (now - context.lastInteraction > expirationTime) {
      conversationContexts.delete(userId);
    }
  });
}, 15 * 60 * 1000); // Run every 15 minutes

// Analyze feedback periodically (once a day in a real system)
setInterval(() => {
  analyzeFeedback();
}, 24 * 60 * 60 * 1000); // Run every 24 hours

module.exports = {
  generateAIResponse,
  analyzeMessage,
  recordFeedback,
  analyzeFeedback
};