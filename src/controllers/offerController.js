/**
 * Offer Controller
 * Handles offer-related API requests
 */

const Offer = require('../models/Offer');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Create a new offer
 * POST /api/offer
 */
exports.createOffer = asyncHandler(async (req, res, next) => {
  const { name, value_props, ideal_use_cases } = req.body;
  
  // Validate input
  if (!name || !value_props || !ideal_use_cases) {
    return next(new AppError('Missing required fields', 400));
  }
  
  // Create offer
  const offer = await Offer.create({
    name,
    value_props,
    ideal_use_cases
  });
  
  logger.info('Offer created', { offerId: offer._id, name: offer.name });
  
  res.status(201).json({
    status: 'success',
    data: {
      offer
    }
  });
});

/**
 * Get latest offer
 * GET /api/offer
 */
exports.getLatestOffer = asyncHandler(async (req, res, next) => {
  const offer = await Offer.findOne().sort({ createdAt: -1 });
  
  if (!offer) {
    return next(new AppError('No offer found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      offer
    }
  });
});

/**
 * Get all offers
 * GET /api/offers
 */
exports.getAllOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    count: offers.length,
    data: {
      offers
    }
  });
});

