/**
 * Rule-based Scoring Service
 * Implements rule-based scoring logic (max 50 points)
 */

const { logger } = require('../utils/logger');

/**
 * Score role relevance
 * @param {string} role - The lead's role
 * @returns {number} Score (0, 10, or 20)
 */
const scoreRoleRelevance = (role) => {
  if (!role) return 0;

  const roleLower = role.toLowerCase();
  
  // Decision maker keywords - 20 points
  const decisionMakerKeywords = [
    'ceo', 'cto', 'cfo', 'chief', 'president', 'director', 'head', 
    'founder', 'owner', 'vp', 'vice president', 'general manager',
    'managing director', 'senior vice president'
  ];
  
  // Influencer keywords - 10 points
  const influencerKeywords = [
    'manager', 'lead', 'senior', 'principal', 'specialist', 'architect',
    'coordinator', 'supervisor', 'administrator'
  ];
  
  // Check for decision maker
  if (decisionMakerKeywords.some(keyword => roleLower.includes(keyword))) {
    return 20;
  }
  
  // Check for influencer
  if (influencerKeywords.some(keyword => roleLower.includes(keyword))) {
    return 10;
  }
  
  return 0;
};

/**
 * Score industry match
 * @param {string} industry - The lead's industry
 * @param {Array<string>} idealUseCases - Ideal use cases from offer
 * @returns {number} Score (0, 10, or 20)
 */
const scoreIndustryMatch = (industry, idealUseCases) => {
  if (!industry || !idealUseCases || idealUseCases.length === 0) return 0;

  const industryLower = industry.toLowerCase();
  
  // Check if any ideal use case mentions the industry
  for (const useCase of idealUseCases) {
    const useCaseLower = useCase.toLowerCase();
    
    // Exact match - 20 points
    if (useCaseLower.includes(industryLower) || industryLower.includes(useCaseLower)) {
      return 20;
    }
    
    // Adjacent industries - 10 points (you can expand this logic)
    const adjacentIndustries = ['saas', 'tech', 'technology', 'software'];
    if (adjacentIndustries.some(adj => 
      industryLower.includes(adj) || useCaseLower.includes(adj)
    )) {
      return 10;
    }
  }
  
  return 0;
};

/**
 * Score data completeness
 * @param {Object} lead - Lead object with all fields
 * @returns {number} Score (0 or 10)
 */
const scoreDataCompleteness = (lead) => {
  const requiredFields = ['name', 'role', 'company', 'industry', 'location'];
  const allPresent = requiredFields.every(field => {
    const value = lead[field];
    return value && value.trim().length > 0;
  });
  
  return allPresent ? 10 : 0;
};

/**
 * Calculate total rule-based score
 * @param {Object} lead - Lead object
 * @param {Object} offer - Offer object with ideal use cases
 * @returns {Object} Score breakdown
 */
const calculateRuleScore = (lead, offer) => {
  try {
    const roleScore = scoreRoleRelevance(lead.role);
    const industryScore = scoreIndustryMatch(lead.industry, offer.ideal_use_cases);
    const completenessScore = scoreDataCompleteness(lead);
    
    const totalScore = roleScore + industryScore + completenessScore;
    
    logger.debug('Rule-based score calculated', {
      name: lead.name,
      roleScore,
      industryScore,
      completenessScore,
      totalScore
    });
    
    return {
      roleScore,
      industryScore,
      completenessScore,
      totalScore
    };
  } catch (error) {
    logger.error('Error calculating rule score:', error);
    return {
      roleScore: 0,
      industryScore: 0,
      completenessScore: 0,
      totalScore: 0
    };
  }
};

module.exports = {
  calculateRuleScore,
  scoreRoleRelevance,
  scoreIndustryMatch,
  scoreDataCompleteness
};

