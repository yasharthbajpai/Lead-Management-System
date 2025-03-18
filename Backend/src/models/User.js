const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['login', 'create_lead', 'update_lead', 'interaction', 'other']
  },
  points: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent'],
    default: 'agent'
  },
  score: {
    type: Number,
    default: 0
  },
  activities: [activitySchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add score and record activity
userSchema.methods.addActivity = async function(type, points, description = '') {
  const activity = {
    type,
    points,
    description,
    timestamp: new Date()
  };
  
  this.activities.push(activity);
  this.score += points;
  
  if (type === 'login') {
    this.lastLogin = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 