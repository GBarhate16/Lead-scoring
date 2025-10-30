/**
 * Offer Routes
 * Routes for managing offers
 */

const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');

// POST /api/offer - Create a new offer
router.post('/', offerController.createOffer);

// GET /api/offer - Get latest offer
router.get('/', offerController.getLatestOffer);

// GET /api/offers - Get all offers
router.get('/all', offerController.getAllOffers);

module.exports = router;

