/**
 * Unit tests for scoring logic
 * Tests rule-based scoring calculations
 */

const {
  calculateRuleScore,
  scoreRoleRelevance,
  scoreIndustryMatch,
  scoreDataCompleteness
} = require('../src/services/ruleScoringService');

describe('Rule-Based Scoring', () => {
  
  describe('scoreRoleRelevance', () => {
    test('should return 20 for decision maker roles', () => {
      expect(scoreRoleRelevance('CEO')).toBe(20);
      expect(scoreRoleRelevance('Chief Technology Officer')).toBe(20);
      expect(scoreRoleRelevance('Head of Sales')).toBe(20);
      expect(scoreRoleRelevance('Director of Marketing')).toBe(20);
    });

    test('should return 10 for influencer roles', () => {
      expect(scoreRoleRelevance('Sales Manager')).toBe(10);
      expect(scoreRoleRelevance('Senior Developer')).toBe(10);
      expect(scoreRoleRelevance('Marketing Lead')).toBe(10);
    });

    test('should return 0 for other roles', () => {
      expect(scoreRoleRelevance('Developer')).toBe(0);
      expect(scoreRoleRelevance('Designer')).toBe(0);
    });

    test('should return 0 for empty/null roles', () => {
      expect(scoreRoleRelevance('')).toBe(0);
      expect(scoreRoleRelevance(null)).toBe(0);
      expect(scoreRoleRelevance(undefined)).toBe(0);
    });
  });

  describe('scoreIndustryMatch', () => {
    const idealUseCases = ['B2B SaaS mid-market', 'Sales teams'];

    test('should return 20 for exact industry match', () => {
      expect(scoreIndustryMatch('B2B SaaS', idealUseCases)).toBe(20);
      expect(scoreIndustryMatch('Technology', idealUseCases)).toBe(10); // Adjacent
    });

    test('should return 0 for no match', () => {
      expect(scoreIndustryMatch('Healthcare', idealUseCases)).toBe(0);
      expect(scoreIndustryMatch('Retail', idealUseCases)).toBe(0);
    });

    test('should return 0 for empty values', () => {
      expect(scoreIndustryMatch('', idealUseCases)).toBe(0);
      expect(scoreIndustryMatch(null, idealUseCases)).toBe(0);
    });
  });

  describe('scoreDataCompleteness', () => {
    test('should return 10 for complete data', () => {
      const lead = {
        name: 'John Doe',
        role: 'CEO',
        company: 'TechCorp',
        industry: 'Technology',
        location: 'New York'
      };
      expect(scoreDataCompleteness(lead)).toBe(10);
    });

    test('should return 0 for incomplete data', () => {
      const lead = {
        name: 'John Doe',
        role: '',
        company: 'TechCorp',
        industry: 'Technology',
        location: 'New York'
      };
      expect(scoreDataCompleteness(lead)).toBe(0);
    });
  });

  describe('calculateRuleScore', () => {
    test('should calculate total rule score correctly', () => {
      const lead = {
        name: 'Ava Patel',
        role: 'Head of Growth',
        company: 'FlowMetrics',
        industry: 'B2B SaaS',
        location: 'San Francisco'
      };

      const offer = {
        ideal_use_cases: ['B2B SaaS mid-market', 'Sales teams']
      };

      const result = calculateRuleScore(lead, offer);
      
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.totalScore).toBeLessThanOrEqual(50);
      expect(result.roleScore).toBe(20); // Head of Growth
      expect(result.industryScore).toBe(20); // Exact match
      expect(result.completenessScore).toBe(10); // All fields present
    });

    test('should handle empty offer gracefully', () => {
      const lead = {
        name: 'John Doe',
        role: 'Developer',
        company: 'TechCorp',
        industry: 'Technology',
        location: 'New York'
      };

      const offer = {
        ideal_use_cases: []
      };

      const result = calculateRuleScore(lead, offer);
      expect(result.totalScore).toBe(0); // Only completeness score
    });
  });
});

