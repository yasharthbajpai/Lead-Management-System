const User = require('../models/User');

// Score points for different activities
const SCORE_POINTS = {
  LOGIN: 50,
  CREATE_LEAD: 30,
  UPDATE_LEAD: 15,
  INTERACTION: 25,
  OTHER: 5
};

/**
 * Add activity points to a user
 * @param {string} userId - The ID of the user
 * @param {string} activityType - The type of activity
 * @param {string} description - Optional description of the activity
 * @returns {Promise} - The updated user object
 */
const addActivityScore = async (userId, activityType, description = '') => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    let points = 0;
    switch (activityType) {
      case 'login':
        points = SCORE_POINTS.LOGIN;
        break;
      case 'create_lead':
        points = SCORE_POINTS.CREATE_LEAD;
        break;
      case 'update_lead':
        points = SCORE_POINTS.UPDATE_LEAD;
        break;
      case 'interaction':
        points = SCORE_POINTS.INTERACTION;
        break;
      default:
        points = SCORE_POINTS.OTHER;
    }
    
    await user.addActivity(activityType, points, description);
    return user;
  } catch (error) {
    console.error('Error adding activity score:', error);
    throw error;
  }
};

/**
 * Get user score and activities
 * @param {string} userId - The ID of the user
 * @returns {Promise} - Object containing user score and activities
 */
const getUserScore = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      score: user.score,
      activities: user.activities
    };
  } catch (error) {
    console.error('Error getting user score:', error);
    throw error;
  }
};

module.exports = {
  addActivityScore,
  getUserScore,
  SCORE_POINTS
}; 