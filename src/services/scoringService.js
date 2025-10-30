/**
 * Scoring Service
 * Orchestrates rule-based and AI scoring to produce final results
 */

const { calculateRuleScore } = require('./ruleScoringService');
const { calculateAIScore } = require('./aiScoringService');
const { logger } = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Score a single lead
 * @param {Object} lead - Lead object
 * @param {Object} offer - Offer object
 * @returns {Object} Complete scoring result
 */
const scoreLead = async (lead, offer) => {
  try {
    // Calculate rule-based score
    const ruleResult = calculateRuleScore(lead, offer);
    
    // Calculate AI-based score
    const aiResult = await calculateAIScore(lead, offer);
    
    // Combine scores
    const finalScore = ruleResult.totalScore + aiResult.score;
    
    // Use the AI's intent classification as the final intent
    const intent = aiResult.intent;
    
    // Combine reasoning
    const reasoning = `${aiResult.reasoning} Rule-based analysis: ${getRuleBreakdown(ruleResult)}`;
    
    logger.debug('Lead scored', {
      name: lead.name,
      finalScore,
      intent,
      ruleScore: ruleResult.totalScore,
      aiScore: aiResult.score
    });
    
    return {
      ...lead,
      intent,
      score: finalScore,
      reasoning,
      ruleScore: ruleResult.totalScore,
      aiScore: aiResult.score,
      scoreBreakdown: ruleResult
    };
  } catch (error) {
    logger.error('Error scoring lead:', error);
    throw new AppError('Failed to score lead', 500);
  }
};

/**
 * Get rule breakdown description
 * @param {Object} ruleResult - Rule scoring result
 * @returns {string} Breakdown description
 */
const getRuleBreakdown = (ruleResult) => {
  const parts = [];
  
  if (ruleResult.roleScore > 0) {
    parts.push(`role relevance (${ruleResult.roleScore} pts)`);
  }
  if (ruleResult.industryScore > 0) {
    parts.push(`industry match (${ruleResult.industryScore} pts)`);
  }
  if (ruleResult.completenessScore > 0) {
    parts.push(`data completeness (${ruleResult.completenessScore} pts)`);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'no rule matches';
};

/**
 * Score multiple leads
 * @param {Array<Object>} leads - Array of lead objects
 * @param {Object} offer - Offer object
 * @returns {Array<Object>} Scored leads
 */
const scoreLeads = async (leads, offer) => {
  try {
    logger.info(`Scoring ${leads.length} leads`);
    
    // Score leads in parallel (with rate limiting consideration)
    const scorePromises = leads.map(lead => scoreLead(lead, offer));
    const results = await Promise.all(scorePromises);
    
    logger.info(`Successfully scored ${results.length} leads`);
    
    return results;
  } catch (error) {
    logger.error('Error scoring leads:', error);
    throw new AppError('Failed to score leads', 500);
  }
};

module.exports = {
  scoreLead,
  scoreLeads
};

