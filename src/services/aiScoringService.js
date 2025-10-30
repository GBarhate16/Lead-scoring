/**
 * AI-based Scoring Service
 * Integrates with OpenAI or Google Gemini for intelligent lead scoring
 */

const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

// Initialize AI clients
let openai = null;
let gemini = null;

// Check for valid OpenAI API key
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' && process.env.OPENAI_API_KEY.trim() !== '') {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    logger.info('OpenAI client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize OpenAI client:', error.message);
  }
} else {
  logger.warn('OpenAI API key not configured or invalid');
}

// Check for valid Gemini API key
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && process.env.GEMINI_API_KEY.trim() !== '') {
  try {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    logger.info('Gemini client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Gemini client:', error.message);
  }
} else {
  logger.warn('Gemini API key not configured or invalid');
}

/**
 * Get AI-based intent classification and score
 * @param {Object} lead - Lead object
 * @param {Object} offer - Offer object
 * @returns {Object} AI score and reasoning
 */
const calculateAIScore = async (lead, offer) => {
  try {
    // Determine which AI provider to use
    const aiProvider = process.env.AI_PROVIDER?.toLowerCase() || 'openai';
    
    // Prefer OpenAI if available, fallback to Gemini
    if (openai && aiProvider === 'openai') {
      return await calculateOpenAIScore(lead, offer);
    } else if (gemini && aiProvider === 'gemini') {
      return await calculateGeminiScore(lead, offer);
    } else if (openai) {
      // Fallback to OpenAI if available
      logger.info('Gemini not configured, using OpenAI');
      return await calculateOpenAIScore(lead, offer);
    } else if (gemini) {
      // Fallback to Gemini if available
      logger.info('OpenAI not configured, using Gemini');
      return await calculateGeminiScore(lead, offer);
    } else {
      logger.warn('No AI provider configured, using fallback scoring');
      return getFallbackScore(lead, offer);
    }
  } catch (error) {
    logger.error('Error calculating AI score:', error);
    
    // Fallback to heuristic scoring if AI fails
    logger.info('Using fallback scoring due to AI error');
    return getFallbackScore(lead, offer);
  }
};

/**
 * Calculate score using OpenAI
 * @param {Object} lead - Lead object
 * @param {Object} offer - Offer object
 * @returns {Object} AI score and reasoning
 */
const calculateOpenAIScore = async (lead, offer) => {
  try {
    // Construct prompt for AI
    const prompt = constructPrompt(lead, offer);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are an expert B2B sales intelligence assistant that evaluates lead quality and buying intent based on prospect data and product offerings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent responses
      max_tokens: 150
    });

    const aiResponse = response.choices[0].message.content.trim();
    
    // Parse AI response
    const { intent, reasoning } = parseAIResponse(aiResponse);
    
    // Map intent to score
    const score = mapIntentToScore(intent);
    
    logger.debug('OpenAI score calculated', {
      name: lead.name,
      intent,
      score,
      reasoning: reasoning.substring(0, 100)
    });

    return {
      intent,
      score,
      reasoning
    };
  } catch (error) {
    logger.error('Error with OpenAI:', error);
    throw error;
  }
};

/**
 * Calculate score using Google Gemini
 * @param {Object} lead - Lead object
 * @param {Object} offer - Offer object
 * @returns {Object} AI score and reasoning
 */
const calculateGeminiScore = async (lead, offer) => {
  try {
    // Try different model names that might be available
    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'models/gemini-pro'];
    let model = null;
    let selectedModelName = '';
    
    for (const modelName of modelNames) {
      try {
        model = gemini.getGenerativeModel({ model: modelName });
        selectedModelName = modelName;
        // Test the model with a simple prompt
        await model.generateContent('Hello');
        logger.info(`Successfully connected to Gemini model: ${modelName}`);
        break;
      } catch (error) {
        logger.warn(`Failed to connect to Gemini model ${modelName}:`, error.message);
        continue;
      }
    }
    
    if (!model) {
      throw new Error('Unable to connect to any available Gemini model');
    }
    
    // Construct full prompt with system instruction
    const systemPrompt = 'You are an expert B2B sales intelligence assistant that evaluates lead quality and buying intent based on prospect data and product offerings.';
    const userPrompt = constructPrompt(lead, offer);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Call Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text().trim();
    
    // Parse AI response
    const { intent, reasoning } = parseAIResponse(aiResponse);
    
    // Map intent to score
    const score = mapIntentToScore(intent);
    
    logger.debug('Gemini score calculated', {
      name: lead.name,
      intent,
      score,
      reasoning: reasoning.substring(0, 100)
    });

    return {
      intent,
      score,
      reasoning
    };
  } catch (error) {
    logger.error('Error with Gemini:', error);
    throw error;
  }
};

/**
 * Construct prompt for OpenAI
 * @param {Object} lead - Lead object
 * @param {Object} offer - Offer object
 * @returns {string} Prompt text
 */
const constructPrompt = (lead, offer) => {
  return `Analyze this lead for the following product offering:

PRODUCT: ${offer.name}
VALUE PROPOSITIONS: ${offer.value_props.join(', ')}
IDEAL USE CASES: ${offer.ideal_use_cases.join(', ')}

LEAD INFORMATION:
- Name: ${lead.name}
- Role: ${lead.role}
- Company: ${lead.company}
- Industry: ${lead.industry}
- Location: ${lead.location}
- LinkedIn Bio: ${lead.linkedin_bio || 'Not provided'}

Task: Classify the buying intent as High, Medium, or Low and provide a brief reasoning (1-2 sentences).

Respond in this exact format:
INTENT: [High/Medium/Low]
REASONING: [your brief explanation]`;
};

/**
 * Parse AI response
 * @param {string} response - AI response text
 * @returns {Object} Parsed intent and reasoning
 */
const parseAIResponse = (response) => {
  try {
    // Extract intent
    const intentMatch = response.match(/INTENT:\s*(High|Medium|Low)/i);
    const intent = intentMatch ? intentMatch[1].charAt(0).toUpperCase() + intentMatch[1].slice(1).toLowerCase() : 'Medium';
    
    // Extract reasoning
    const reasoningMatch = response.match(/REASONING:\s*(.+?)(?:\n|$)/i);
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'AI analysis completed';
    
    return { intent, reasoning };
  } catch (error) {
    logger.error('Error parsing AI response:', error);
    return {
      intent: 'Medium',
      reasoning: 'Unable to parse AI response'
    };
  }
};

/**
 * Map intent to score
 * @param {string} intent - High, Medium, or Low
 * @returns {number} Score (50, 30, or 10)
 */
const mapIntentToScore = (intent) => {
  const mapping = {
    'High': 50,
    'Medium': 30,
    'Low': 10
  };
  
  return mapping[intent] || 30;
};

/**
 * Fallback scoring when AI is unavailable
 * @param {Object} lead - Lead object
 * @param {Object} offer - Offer object
 * @returns {Object} Fallback score and reasoning
 */
const getFallbackScore = (lead, offer) => {
  // Simple heuristic based on available data
  let score = 30; // Default Medium
  let intent = 'Medium';
  let reasoning = 'AI service unavailable, using heuristic scoring';
  
  // Check for strong signals
  const hasStrongRole = ['ceo', 'cto', 'founder', 'director', 'head'].some(
    keyword => lead.role?.toLowerCase().includes(keyword)
  );
  
  const hasRelevantIndustry = offer.ideal_use_cases.some(
    useCase => lead.industry?.toLowerCase().includes(useCase.toLowerCase())
  );
  
  if (hasStrongRole && hasRelevantIndustry) {
    score = 50;
    intent = 'High';
    reasoning = 'Strong indicators: relevant role and industry match';
  } else if (hasStrongRole || hasRelevantIndustry) {
    score = 30;
    intent = 'Medium';
    reasoning = 'Moderate indicators present';
  } else {
    score = 10;
    intent = 'Low';
    reasoning = 'Limited indicators of strong fit';
  }
  
  return { intent, score, reasoning };
};

module.exports = {
  calculateAIScore
};

