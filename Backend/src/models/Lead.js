const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  source: { 
    type: String, 
    required: true,
    enum: ['web_form', 'whatsapp', 'email', 'other']
  },
  initialMessage: { 
    type: String 
  },
  leadScore: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['new', 'qualified', 'contacted', 'converted', 'lost'],
    default: 'new'
  },
  tags: [{ 
    type: String 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema); 