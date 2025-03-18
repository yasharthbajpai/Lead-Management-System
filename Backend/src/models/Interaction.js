const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  leadId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lead',
    required: true 
  },
  channel: {
    type: String,
    required: true,
    enum: ['email', 'phone', 'web', 'social', 'in-person', 'other']
  },
  direction: {
    type: String,
    required: true,
    enum: ['inbound', 'outbound']
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['communication', 'engagement', 'insight'],
    default: 'communication'
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral', null],
    default: null
  },
  intentScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  // Fields for insights functionality
  insights: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  recommendedActions: [{
    action: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    description: String
  }],
  // Common fields
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Interaction', interactionSchema); 