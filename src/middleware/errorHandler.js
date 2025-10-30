/**
 * Global error handling middleware
 * Centralized error handling for all routes
 */

const { logger } = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production error response (hide sensitive details)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message || 'Something went wrong'
    });
  }
};

// Handle async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle 404 errors
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFoundHandler
};

