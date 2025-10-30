/**
 * Results Routes
 * Routes for retrieving results
 */

const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

// GET /api/results?batchId=xxx - Get results for a batch
router.get('/', resultsController.getResults);

// GET /api/results/export?batchId=xxx - Export results as CSV
router.get('/export', resultsController.exportResultsCSV);

// GET /api/results/all - Get all results
router.get('/all', resultsController.getAllResults);

module.exports = router;

