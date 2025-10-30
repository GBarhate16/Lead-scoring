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
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Lead Scoring API',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  };
  
  if (mongoose.connection.readyState !== 1) {
    healthStatus.status = 'error';
    healthStatus.mongodb = 'disconnected';
  }
  
  res.status(healthStatus.mongodb === 'connected' ? 200 : 503).json(healthStatus);
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
    // Add connection options for better reliability
    const mongooseOptions = {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    // Don't exit immediately, let the application handle retries
    throw error;
  }
};

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

