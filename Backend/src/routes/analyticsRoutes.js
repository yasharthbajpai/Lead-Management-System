const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const Interaction = require('../models/Interaction');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get lead status distribution
router.get('/leads/status', auth, async (req, res) => {
  try {
    const data = await analyticsService.getLeadStatusCounts();
    res.json(data);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get lead source distribution
router.get('/leads/source', auth, async (req, res) => {
  try {
    const data = await analyticsService.getLeadSourceCounts();
    res.json(data);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get conversion metrics
router.get('/conversions', auth, async (req, res) => {
  try {
    const data = await analyticsService.getConversionMetrics();
    res.json(data);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get lead score distribution
router.get('/leads/scores', auth, async (req, res) => {
  try {
    const data = await analyticsService.getLeadScoreDistribution();
    res.json(data);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get interaction channel distribution
router.get('/interactions/channel', auth, async (req, res) => {
  try {
    const data = await analyticsService.getInteractionChannelCounts();
    res.json(data);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get leads over time
router.get('/leads/time', auth, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const data = await analyticsService.getLeadsOverTime(days);
    res.json(data);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get dashboard summary data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const dashboardData = await analyticsService.getDashboardData();
    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ===== Added Insight Functionality =====

// Get insights for a specific lead
router.get('/insights/lead/:leadId', auth, async (req, res) => {
  try {
    const insights = await Interaction.find({ 
      leadId: req.params.leadId,
      type: 'insight'
    }).sort({ timestamp: -1 });
    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all recent insights
router.get('/insights/recent', auth, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const insights = await Interaction.find({ type: 'insight' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('leadId', 'name email');
    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create insight
router.post('/insights', auth, async (req, res) => {
  const insight = new Interaction({
    leadId: req.body.leadId,
    type: 'insight',
    channel: 'other',
    direction: 'outbound',
    content: 'System generated insight',
    insights: req.body.insights,
    recommendedActions: req.body.recommendedActions,
    createdBy: req.user._id
  });

  try {
    const newInsight = await insight.save();
    res.status(201).json(newInsight);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== User Performance Analytics =====

// Get top performing users
router.get('/users/top', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const topUsers = await User.find({}, 'name email role score lastLogin')
      .sort({ score: -1 })
      .limit(limit);
    
    res.json(topUsers);
  } catch (err) {
    console.error('User analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get user activity summary
router.get('/users/activity', auth, async (req, res) => {
  try {
    // For managers, get their team's activity
    // For admin, get all users' activity
    // For agents, get their own activity
    
    let userIds;
    if (req.user.role === 'admin') {
      // Get all users
      userIds = (await User.find({}, '_id')).map(user => user._id);
    } else if (req.user.role === 'manager') {
      // In a real system, we'd fetch users under this manager
      // For simplicity, we'll just get all non-admin users
      userIds = (await User.find({ role: { $ne: 'admin' } }, '_id')).map(user => user._id);
    } else {
      // Just get this user's data
      userIds = [req.user._id];
    }
    
    // Get activity summary for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const users = await User.find(
      { 
        _id: { $in: userIds },
        'activities.timestamp': { $gte: thirtyDaysAgo }
      },
      'name email role score activities'
    );
    
    // Process activity data
    const activitySummary = users.map(user => {
      // Group activities by type
      const activityByType = {};
      let totalPoints = 0;
      
      user.activities.forEach(activity => {
        if (activity.timestamp >= thirtyDaysAgo) {
          if (!activityByType[activity.type]) {
            activityByType[activity.type] = {
              count: 0,
              points: 0
            };
          }
          
          activityByType[activity.type].count += 1;
          activityByType[activity.type].points += activity.points;
          totalPoints += activity.points;
        }
      });
      
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        totalScore: user.score,
        last30DaysScore: totalPoints,
        activityBreakdown: activityByType
      };
    });
    
    res.json(activitySummary);
  } catch (err) {
    console.error('User activity analytics error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 