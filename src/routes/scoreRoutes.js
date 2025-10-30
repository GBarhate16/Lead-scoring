/**
 * Score Routes
 * Routes for scoring leads
 */

const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

// POST /api/score - Score leads
router.post('/', scoreController.scoreLeads);

module.exports = router;

