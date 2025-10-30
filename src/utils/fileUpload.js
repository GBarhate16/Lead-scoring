/**
 * File Upload Utility
 * Configures multer for handling file uploads
 */

const multer = require('multer');
const { AppError } = require('../middleware/errorHandler');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for CSV only
const fileFilter = (req, file, cb) => {
  // Check file extension
  const allowedExtensions = ['.csv'];
  const fileExtension = file.originalname.toLowerCase().substring(
    file.originalname.lastIndexOf('.')
  );
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new AppError('Only CSV files are allowed', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;

