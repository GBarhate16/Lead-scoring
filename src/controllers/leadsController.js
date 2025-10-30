/**
 * Leads Controller
 * Handles lead-related API requests
 */

const Lead = require('../models/Lead');
const Offer = require('../models/Offer');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { parseCSV, validateLead } = require('../utils/csvParser');
const upload = require('../utils/fileUpload');

/**
 * Upload leads from CSV
 * POST /api/leads/upload
 */
exports.uploadLeads = [upload.single('leads'), asyncHandler(async (req, res, next) => {
  // Check if file was uploaded
  if (!req.file) {
    return next(new AppError('Please upload a CSV file', 400));
  }
  
  // Get the latest offer
  const offer = await Offer.findOne().sort({ createdAt: -1 });
  if (!offer) {
    return next(new AppError('No offer found. Please create an offer first', 404));
  }
  
  // Parse CSV
  const leadsData = parseCSV(req.file.buffer);
  
  if (leadsData.length === 0) {
    return next(new AppError('CSV file is empty', 400));
  }
  
  // Validate each lead
  const validLeads = [];
  const invalidLeads = [];
  
  leadsData.forEach((lead, index) => {
    if (validateLead(lead)) {
      validLeads.push(lead);
    } else {
      invalidLeads.push({ index: index + 2, lead }); // +2 for header and 1-based index
    }
  });
  
  if (validLeads.length === 0) {
    return next(new AppError('No valid leads found in CSV', 400));
  }
  
  // Generate batch ID
  const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Save leads to database
  const leads = await Lead.insertMany(
    validLeads.map(lead => ({
      ...lead,
      offerId: offer._id,
      batchId
    }))
  );
  
  logger.info('Leads uploaded', {
    batchId,
    total: validLeads.length,
    invalid: invalidLeads.length,
    offerId: offer._id
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      batchId,
      leadsCount: leads.length,
      invalidCount: invalidLeads.length,
      leads
    }
  });
})];

/**
 * Get all leads
 * GET /api/leads
 */
exports.getAllLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    count: leads.length,
    data: {
      leads
    }
  });
});

/**
 * Get leads by batch ID
 * GET /api/leads/batch/:batchId
 */
exports.getLeadsByBatch = asyncHandler(async (req, res, next) => {
  const { batchId } = req.params;
  
  const leads = await Lead.find({ batchId }).sort({ createdAt: -1 });
  
  if (leads.length === 0) {
    return next(new AppError('No leads found for this batch', 404));
  }
  
  res.status(200).json({
    status: 'success',
    count: leads.length,
    data: {
      leads
    }
  });
});

