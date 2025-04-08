/**
 * Language detection and translation service for the healthcare chatbot
 * 
 * This service provides language detection and translation capabilities
 * to make the chatbot accessible to a diverse patient population.
 */

// In a production environment, you would use a proper language detection
// and translation API like Google Cloud Translation, Azure Translator,
// or a dedicated NPM package like 'franc' for language detection

// Common language patterns for basic detection
const languagePatterns = {
  english: {
    code: 'en',
    patterns: [
      /\b(the|a|an|is|are|was|were|have|has|had|will|would|can|could|should|may|might)\b/i,
      /\b(hello|hi|hey|good|thank|please|help|need|want|question|problem)\b/i
    ]
  },
  spanish: {
    code: 'es',
    patterns: [
      /\b(el|la|los|las|un|una|es|son|era|fueron|tiene|tengo|había|será|sería|puede|podría|debería)\b/i,
      /\b(hola|buenos|gracias|por favor|ayuda|necesito|quiero|pregunta|problema)\b/i
    ]
  },
  french: {
    code: 'fr',
    patterns: [
      /\b(le|la|les|un|une|est|sont|était|ont|avait|sera|serait|peut|pourrait|devrait)\b/i,
      /\b(bonjour|salut|merci|s'il vous plaît|aide|besoin|veux|question|problème)\b/i
    ]
  },
  chinese: {
    code: 'zh',
    // Simplified check for Chinese characters
    patterns: [/[\u4e00-\u9fff]/]
  },
  arabic: {
    code: 'ar',
    // Basic check for Arabic script
    patterns: [/[\u0600-\u06FF]/]
  }
};

/**
 * Detects the language of a given text
 * @param {string} text - The text to analyze
 * @returns {string} The detected language code (default: 'en')
 */
const detectLanguage = (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return 'en'; // Default to English for empty input
  }
  
  // Check each language pattern
  for (const [language, data] of Object.entries(languagePatterns)) {
    const matchCount = data.patterns.reduce((count, pattern) => {
      return count + (pattern.test(text) ? 1 : 0);
    }, 0);
    
    // If more than half of the patterns match, return this language
    if (matchCount > 0 && matchCount >= data.patterns.length / 2) {
      return data.code;
    }
  }
  
  // Default to English if no language is detected
  return 'en';
};

/**
 * Simple translation dictionary for common healthcare phrases
 * In a production environment, you would use a proper translation API
 */
const translationDictionary = {
  // English to Spanish translations for common healthcare phrases
  'en-es': {
    'appointment': 'cita',
    'doctor': 'médico',
    'prescription': 'receta',
    'medication': 'medicamento',
    'symptoms': 'síntomas',
    'pain': 'dolor',
    'fever': 'fiebre',
    'thank you': 'gracias',
    'please': 'por favor',
    'help': 'ayuda',
    'emergency': 'emergencia',
    'hospital': 'hospital',
    'insurance': 'seguro',
    'billing': 'facturación'
  },
  // Add more language pairs as needed
};

/**
 * Translates text from one language to another
 * This is a simplified implementation - in production, use a translation API
 * @param {string} text - The text to translate
 * @param {string} sourceLanguage - Source language code
 * @param {string} targetLanguage - Target language code
 * @returns {string} The translated text (or original if translation not available)
 */
const translateText = (text, sourceLanguage = 'en', targetLanguage = 'en') => {
  // If source and target are the same, no translation needed
  if (sourceLanguage === targetLanguage) {
    return text;
  }
  
  // Check if we have a dictionary for this language pair
  const dictionaryKey = `${sourceLanguage}-${targetLanguage}`;
  const dictionary = translationDictionary[dictionaryKey];
  
  if (!dictionary) {
    // In production, you would call an external translation API here
    console.log(`Translation not available for ${dictionaryKey}`);
    return text;
  }
  
  // Simple word-by-word replacement (very basic implementation)
  let translatedText = text;
  Object.entries(dictionary).forEach(([source, target]) => {
    const regex = new RegExp(`\\b${source}\\b`, 'gi');
    translatedText = translatedText.replace(regex, target);
  });
  
  return translatedText;
};

/**
 * Generates a response in the user's preferred language
 * @param {string} responseText - The original response text (in English)
 * @param {string} userLanguage - The user's preferred language code
 * @returns {string} The translated response
 */
const localizeResponse = (responseText, userLanguage = 'en') => {
  if (userLanguage === 'en') {
    return responseText; // No translation needed
  }
  
  return translateText(responseText, 'en', userLanguage);
};

module.exports = {
  detectLanguage,
  translateText,
  localizeResponse
};