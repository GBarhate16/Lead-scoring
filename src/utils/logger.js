/**
 * Logger utility
 * Provides structured logging throughout the application
 */

const logger = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`, Object.keys(data).length > 0 ? data : '');
  },

  error: (message, error = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp} - ${message}`, error);
  },

  warn: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`, Object.keys(data).length > 0 ? data : '');
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[DEBUG] ${timestamp} - ${message}`, Object.keys(data).length > 0 ? data : '');
    }
  }
};

module.exports = { logger };

