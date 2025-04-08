# TicketHub Healthcare AI Chatbot Integration Guide

## Server Integration

To integrate the enhanced AI features into your existing TicketHub application, you'll need to update your server.js file to include the new routes and ensure all dependencies are properly installed.

### 1. Update server.js

Add the following code to your server.js file to include the enhanced AI routes:

```javascript
// In server.js, after your existing routes

// Enhanced AI routes
app.use('/api/enhanced-ai', require('./routes/enhancedAI'));

// Log that enhanced features are available
console.log('Enhanced Healthcare AI features are enabled');
```

### 2. Install Required Dependencies

The enhanced AI features require a few additional dependencies. Run the following command in your project root:

```bash
npm install multer --save
```

### 3. Update User Model

The enhanced features require additional fields in the User model to store preferences and consent. Add these fields to your User.js model:

```javascript
// Add to User schema
ehrConsent: {
  type: Boolean,
  default: false
},
ehrPatientId: {
  type: String,
  default: null
},
preferredLanguage: {
  type: String,
  enum: ['en', 'es', 'fr', 'zh', 'ar', 'auto'],
  default: 'auto'
},
voicePreference: {
  type: String,
  enum: ['male', 'female'],
  default: 'female'
}
```

## Frontend Integration

To integrate the enhanced AI chat component into your frontend:

### 1. Import the Component

In your ticket detail page or wherever you want to use the enhanced chat:

```javascript
import EnhancedAIChat from '../components/ai/EnhancedAIChat';
```

### 2. Use the Component

Replace your existing chat interface with the enhanced version:

```jsx
<EnhancedAIChat ticketId={id} category={ticket.category} />
```

## Testing the Integration

After integrating the enhanced features, you should test each capability:

1. **HIPAA Compliance**: Send a message containing personal information like a phone number or address
2. **Voice Interface**: Test the voice recording and playback features
3. **Medical Triage**: Send a message describing urgent symptoms to test the triage system
4. **Doctor Recommendations**: Ask about specific symptoms to trigger specialty recommendations
5. **EHR Integration**: Toggle the EHR consent switch to test integration

## Configuration

You can customize which enhanced features are enabled by modifying the `enhancedFeatures.js` configuration file in the backend/config directory.

## Troubleshooting

If you encounter issues with the enhanced features:

1. Check the server console for error messages
2. Verify that all dependencies are installed correctly
3. Ensure the User model has been updated with the required fields
4. Check that the frontend is correctly passing the ticketId and category to the EnhancedAIChat component

For more detailed information on each enhanced feature, refer to the ENHANCEMENTS.md documentation.