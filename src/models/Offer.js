/**
 * Offer Model
 * Stores product/offer information used for lead scoring
 */

const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Offer name is required'],
    trim: true
  },
  value_props: {
    type: [String],
    required: [true, 'Value propositions are required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one value proposition is required'
    }
  },
  ideal_use_cases: {
    type: [String],
    required: [true, 'Ideal use cases are required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one ideal use case is required'
    }
  },
  // Additional metadata
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

// Index for faster queries
offerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Offer', offerSchema);

