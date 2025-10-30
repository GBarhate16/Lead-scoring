/**
 * Database configuration
 * Handles MongoDB connection setup and error handling
 */

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // MongoDB connection options
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;

