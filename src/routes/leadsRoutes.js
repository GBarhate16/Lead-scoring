/**
 * Leads Routes
 * Routes for managing leads
 */

const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leadsController');

// POST /api/leads/upload - Upload leads from CSV
router.post('/upload', leadsController.uploadLeads);

// GET /api/leads - Get all leads
router.get('/', leadsController.getAllLeads);

// GET /api/leads/batch/:batchId - Get leads by batch ID
router.get('/batch/:batchId', leadsController.getLeadsByBatch);

module.exports = router;

