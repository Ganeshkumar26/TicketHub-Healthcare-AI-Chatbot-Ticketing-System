const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tickethub';
// Ensure database name is specified in the connection string
const connectionString = MONGO_URI.endsWith('/') ? `${MONGO_URI}tickethub` : MONGO_URI;
console.log('Connecting to MongoDB with connection string:', connectionString);
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connected successfully');
    // Initialize database with sample data if needed
    // This is optional but can help ensure the database is properly set up
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Please make sure MongoDB is installed and running on your machine');
  });


// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));

// Base route
app.get('/', (req, res) => {
  res.send('TicketHub API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});