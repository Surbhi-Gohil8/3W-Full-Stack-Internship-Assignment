require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Increase JSON payload size limits to allow Base64 encoded image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database connection
// Supports MONGO_URI (recommended) and MONGODB_URL (which exists in the user's local .env file)
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URL;

if (!mongoURI) {
  console.error('CRITICAL ERROR: Database URI (MONGO_URI or MONGODB_URL) is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('MongoDB connection failure:', err.message);
    console.error('Please verify that your database URI is valid and accessible.');
  });

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Base route/Health check
app.get('/', (req, res) => {
  res.json({ message: 'Mini Social Post API is running' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'An unexpected internal error occurred on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Backend server is operating on port ${PORT}`);
});
