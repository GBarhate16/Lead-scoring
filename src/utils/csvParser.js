/**
 * CSV Parser Utility
 * Handles parsing and validation of CSV files
 */

const { parse } = require('csv-parse/sync');
const { logger } = require('./logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Parse CSV file to JSON
 * @param {Buffer} fileBuffer - CSV file buffer
 * @returns {Array<Object>} Parsed lead data
 */
const parseCSV = (fileBuffer) => {
  try {
    // Parse CSV from buffer
    const records = parse(fileBuffer, {
      columns: true, // Use first line as column headers
      skip_empty_lines: true,
      trim: true
    });
    
    // Validate required columns
    const requiredColumns = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
    const providedColumns = Object.keys(records[0] || {});
    
    // Check if all required columns are present
    const missingColumns = requiredColumns.filter(col => !providedColumns.includes(col));
    if (missingColumns.length > 0) {
      throw new AppError(
        `Missing required columns: ${missingColumns.join(', ')}`,
        400
      );
    }
    
    logger.info(`Parsed ${records.length} leads from CSV`);
    
    return records;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error parsing CSV:', error);
    throw new AppError('Invalid CSV file format', 400);
  }
};

/**
 * Validate lead data
 * @param {Object} lead - Lead object
 * @returns {boolean} True if valid
 */
const validateLead = (lead) => {
  const requiredFields = ['name', 'role', 'company', 'industry', 'location'];
  
  for (const field of requiredFields) {
    if (!lead[field] || lead[field].trim().length === 0) {
      return false;
    }
  }
  
  return true;
};

/**
 * Format leads array to CSV string
 * @param {Array<Object>} leads - Array of lead objects
 * @returns {string} CSV string
 */
const formatToCSV = (leads) => {
  if (!leads || leads.length === 0) {
    return '';
  }
  
  // Define CSV columns
  const columns = ['name', 'role', 'company', 'industry', 'location', 'intent', 'score', 'reasoning'];
  
  // Create header row
  const header = columns.join(',');
  
  // Create data rows
  const rows = leads.map(lead => {
    return columns.map(column => {
      const value = lead[column] || '';
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

module.exports = {
  parseCSV,
  validateLead,
  formatToCSV
};

