const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getUserScore } = require('../services/scoreService');
const User = require('../models/User');

// Get current user's score and activities
router.get('/me', auth, async (req, res) => {
  try {
    const scoreData = await getUserScore(req.userId);
    res.json(scoreData);
  } catch (err) {
    console.error('Error fetching user score:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await User.find({}, 'name email score')
      .sort({ score: -1 })
      .limit(10);
    
    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get user score by ID (admin/manager only)
router.get('/user/:userId', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const scoreData = await getUserScore(req.params.userId);
    res.json(scoreData);
  } catch (err) {
    console.error('Error fetching user score:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 