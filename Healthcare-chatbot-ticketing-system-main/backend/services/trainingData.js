/**
 * Training data for the healthcare chatbot NLP model
 * 
 * This file contains categorized healthcare-related questions and phrases
 * used to train the NLP classifier for intent recognition.
 * 
 * Enhanced with additional categories and more comprehensive healthcare terminology
 * to improve intent recognition and response accuracy.
 */

const trainingData = [
  // Appointment scheduling
  { text: "How do I schedule an appointment?", category: "appointment" },
  { text: "I need to book a doctor visit", category: "appointment" },
  { text: "Can I reschedule my appointment?", category: "appointment" },
  { text: "What are your office hours?", category: "appointment" },
  { text: "Is Dr. Smith available next week?", category: "appointment" },
  { text: "I need to cancel my appointment", category: "appointment" },
  { text: "How long is the wait for an appointment?", category: "appointment" },
  { text: "Do you have any openings this week?", category: "appointment" },
  
  // Prescription related
  { text: "I need a refill on my medication", category: "prescription" },
  { text: "When can I pick up my prescription?", category: "prescription" },
  { text: "Are there side effects to my medication?", category: "prescription" },
  { text: "How should I take this medicine?", category: "prescription" },
  { text: "Can I get my prescription delivered?", category: "prescription" },
  { text: "I'm experiencing side effects from my medication", category: "prescription" },
  { text: "Is there a generic version of my medication?", category: "prescription" },
  { text: "How long should I take this medication?", category: "prescription" },
  
  // Billing questions
  { text: "I have a question about my bill", category: "billing" },
  { text: "Does my insurance cover this procedure?", category: "billing" },
  { text: "How much will this cost?", category: "billing" },
  { text: "Can I get a payment plan?", category: "billing" },
  { text: "I think there's an error on my bill", category: "billing" },
  { text: "When is payment due?", category: "billing" },
  { text: "Do you accept my insurance?", category: "billing" },
  { text: "What's my copay amount?", category: "billing" },
  
  // Technical issues
  { text: "I can't log into my account", category: "technical" },
  { text: "The website isn't working", category: "technical" },
  { text: "How do I reset my password?", category: "technical" },
  { text: "I'm having trouble with the app", category: "technical" },
  { text: "The video call isn't connecting", category: "technical" },
  { text: "I can't upload my documents", category: "technical" },
  { text: "The notification system isn't working", category: "technical" },
  { text: "How do I update my contact information?", category: "technical" },
  
  // Symptoms and medical questions - now in their own category for better classification
  { text: "I have a headache that won't go away", category: "symptoms" },
  { text: "My child has a fever", category: "symptoms" },
  { text: "I'm experiencing chest pain", category: "symptoms" },
  { text: "Should I be concerned about this rash?", category: "symptoms" },
  { text: "I've been feeling dizzy lately", category: "symptoms" },
  { text: "My back pain is getting worse", category: "symptoms" },
  { text: "I have questions about my test results", category: "symptoms" },
  { text: "What should I do about these symptoms?", category: "symptoms" },
  { text: "I'm having trouble breathing", category: "symptoms" },
  { text: "My joints are swollen and painful", category: "symptoms" },
  { text: "I've been experiencing numbness in my hands", category: "symptoms" },
  { text: "My vision is blurry sometimes", category: "symptoms" },
  { text: "I've been more tired than usual lately", category: "symptoms" },
  { text: "I'm having digestive problems", category: "symptoms" },
  { text: "My skin is itchy all over", category: "symptoms" },
  { text: "I've noticed unusual weight loss", category: "symptoms" },
  
  // General inquiries
  { text: "What services do you offer?", category: "general" },
  { text: "Do you have specialists?", category: "general" },
  { text: "What are your COVID protocols?", category: "general" },
  { text: "How do I contact a doctor?", category: "general" },
  { text: "Do I need a referral to see a specialist?", category: "general" },
  { text: "What's your address?", category: "general" },
  { text: "Are you accepting new patients?", category: "general" },
  { text: "How do I prepare for my appointment?", category: "general" },
  
  // Preventive care inquiries
  { text: "When should I get a flu shot?", category: "preventive" },
  { text: "How often should I have a physical exam?", category: "preventive" },
  { text: "What screenings are recommended for my age?", category: "preventive" },
  { text: "Do you offer vaccination services?", category: "preventive" },
  { text: "How can I schedule a wellness check?", category: "preventive" },
  { text: "What preventive services are covered by insurance?", category: "preventive" },
  { text: "I need information about cancer screenings", category: "preventive" },
  { text: "What's the recommended schedule for child vaccinations?", category: "preventive" },
  
  // Emergency inquiries
  { text: "What should I do in case of emergency?", category: "emergency" },
  { text: "When should I go to the ER vs urgent care?", category: "emergency" },
  { text: "I think I'm having a medical emergency", category: "emergency" },
  { text: "What are the signs of a heart attack?", category: "emergency" },
  { text: "How do I know if I need emergency care?", category: "emergency" },
  { text: "What's your emergency contact number?", category: "emergency" },
  { text: "Do you have after-hours care?", category: "emergency" },
  { text: "What should I do if I have severe bleeding?", category: "emergency" },
  
  // Mental health inquiries
  { text: "Do you offer mental health services?", category: "mental_health" },
  { text: "I'm feeling depressed and need help", category: "mental_health" },
  { text: "How can I schedule a therapy appointment?", category: "mental_health" },
  { text: "Do you have psychiatrists available?", category: "mental_health" },
  { text: "I'm having anxiety attacks", category: "mental_health" },
  { text: "What mental health resources do you offer?", category: "mental_health" },
  { text: "I need help with stress management", category: "mental_health" },
  { text: "Do you prescribe medication for mental health conditions?", category: "mental_health" }
];

module.exports = trainingData;