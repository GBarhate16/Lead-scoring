/**
 * Score Controller
 * Handles lead scoring requests
 */

const Lead = require('../models/Lead');
const Offer = require('../models/Offer');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { scoreLeads } = require('../services/scoringService');

/**
 * Score leads
 * POST /api/score
 */
exports.scoreLeads = asyncHandler(async (req, res, next) => {
  const { batchId } = req.body;
  
  if (!batchId) {
    return next(new AppError('Batch ID is required', 400));
  }
  
  // Get leads by batch ID
  const leads = await Lead.find({ batchId });
  
  if (leads.length === 0) {
    return next(new AppError('No leads found for this batch', 404));
  }
  
  // Get the offer
  const offer = await Offer.findById(leads[0].offerId);
  if (!offer) {
    return next(new AppError('Offer not found', 404));
  }
  
  logger.info('Starting scoring process', { batchId, leadsCount: leads.length });
  
  // Score all leads
  const scoredLeads = await scoreLeads(leads, offer);
  
  // Update leads in database with scores
  logger.info('Starting database updates', { batchId, leadsCount: scoredLeads.length });
  
  let successfulUpdates = 0;
  
  // Update leads sequentially to ensure all updates complete
  for (let i = 0; i < scoredLeads.length; i++) {
    const lead = scoredLeads[i];
    try {
      logger.debug('Updating lead', { 
        index: i,
        leadId: lead._id, 
        intent: lead.intent, 
        score: lead.score,
        ruleScore: lead.ruleScore,
        aiScore: lead.aiScore
      });
      
      // Update the lead using updateOne
      const result = await Lead.updateOne(
        { _id: lead._id },
        {
          $set: {
            intent: lead.intent,
            score: lead.score,
            reasoning: lead.reasoning,
            ruleScore: lead.ruleScore,
            aiScore: lead.aiScore,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount === 0) {
        logger.error('Failed to update lead', { index: i, leadId: lead._id });
      } else {
        successfulUpdates++;
        logger.debug('Successfully updated lead', { 
          index: i,
          leadId: lead._id
        });
      }
    } catch (error) {
      logger.error('Error updating lead', { 
        index: i,
        leadId: lead._id, 
        error: error.message
      });
    }
  }
  
  logger.info('Database updates completed', { 
    batchId, 
    leadsCount: scoredLeads.length,
    successfulUpdates
  });

  logger.info('Scoring completed', { batchId, leadsCount: scoredLeads.length });
  
  res.status(200).json({
    status: 'success',
    data: {
      batchId,
      leadsCount: scoredLeads.length,
      leads: scoredLeads.map(lead => ({
        _id: lead._id,
        name: lead.name,
        role: lead.role,
        company: lead.company,
        industry: lead.industry,
        location: lead.location,
        linkedin_bio: lead.linkedin_bio,
        intent: lead.intent,
        score: lead.score,
        reasoning: lead.reasoning,
        ruleScore: lead.ruleScore,
        aiScore: lead.aiScore,
        batchId: lead.batchId,
        offerId: lead.offerId,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt
      }))
    }
  });
});

