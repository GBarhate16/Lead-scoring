/**
 * Main server entry point
 * Sets up Express app, connects to MongoDB, and starts the server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Import routes
const offerRoutes = require('./routes/offerRoutes');
const leadsRoutes = require('./routes/leadsRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const resultsRoutes = require('./routes/resultsRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/offer', offerRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/results', resultsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Lead Scoring API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Lead Scoring API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      offer: '/api/offer',
      leadsUpload: '/api/leads/upload',
      score: '/api/score',
      results: '/api/results'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

