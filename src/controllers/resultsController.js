/**
 * Results Controller
 * Handles results retrieval and export
 */

const Lead = require('../models/Lead');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { formatToCSV } = require('../utils/csvParser');

/**
 * Get results for a batch
 * GET /api/results?batchId=xxx
 */
exports.getResults = asyncHandler(async (req, res, next) => {
  const { batchId } = req.query;
  
  if (!batchId) {
    return next(new AppError('Batch ID is required', 400));
  }
  
  // Get leads by batch ID, sorted by score
  const leads = await Lead.find({ batchId })
    .select('name role company intent score reasoning createdAt')
    .sort({ score: -1 });
  
  if (leads.length === 0) {
    return next(new AppError('No results found for this batch', 404));
  }
  
  logger.info('Results retrieved', { batchId, count: leads.length });
  
  res.status(200).json({
    status: 'success',
    count: leads.length,
    data: {
      leads
    }
  });
});

/**
 * Export results as CSV
 * GET /api/results/export?batchId=xxx
 */
exports.exportResultsCSV = asyncHandler(async (req, res, next) => {
  const { batchId } = req.query;
  
  if (!batchId) {
    return next(new AppError('Batch ID is required', 400));
  }
  
  // Get leads by batch ID
  const leads = await Lead.find({ batchId })
    .select('name role company industry location intent score reasoning')
    .sort({ score: -1 });
  
  if (leads.length === 0) {
    return next(new AppError('No results found for this batch', 404));
  }
  
  // Format to CSV
  const csv = formatToCSV(leads);
  
  logger.info('Results exported to CSV', { batchId, count: leads.length });
  
  // Set headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="lead-results-${batchId}.csv"`);
  
  res.status(200).send(csv);
});

/**
 * Get all results
 * GET /api/results/all
 */
exports.getAllResults = asyncHandler(async (req, res) => {
  const leads = await Lead.find()
    .select('name role company intent score reasoning batchId createdAt')
    .sort({ score: -1 });
  
  res.status(200).json({
    status: 'success',
    count: leads.length,
    data: {
      leads
    }
  });
});

