/**
 * Lead Model
 * Stores prospect information and scoring results
 */

const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  linkedin_bio: {
    type: String,
    trim: true
  },
  // Scoring fields
  intent: {
    type: String,
    enum: ['High', 'Medium', 'Low', null],
    default: null
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  reasoning: {
    type: String,
    trim: true
  },
  // Breakdown of scores
  ruleScore: {
    type: Number,
    default: 0
  },
  aiScore: {
    type: Number,
    default: 0
  },
  // Additional metadata
  batchId: {
    type: String,
    required: true,
    index: true
  },
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
leadSchema.index({ batchId: 1, createdAt: -1 });
leadSchema.index({ score: -1 });

module.exports = mongoose.model('Lead', leadSchema);

