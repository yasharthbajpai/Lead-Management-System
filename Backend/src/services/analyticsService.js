const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');

/**
 * Get lead counts by status
 * @returns {Promise<Object>} - Status counts
 */
const getLeadStatusCounts = async () => {
  try {
    const counts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Convert to a more usable format
    const result = {};
    counts.forEach(item => {
      result[item._id] = item.count;
    });
    
    return result;
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
};

/**
 * Get lead counts by source
 * @returns {Promise<Object>} - Source counts
 */
const getLeadSourceCounts = async () => {
  try {
    const counts = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    
    // Convert to a more usable format
    const result = {};
    counts.forEach(item => {
      result[item._id] = item.count;
    });
    
    return result;
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
};

/**
 * Get conversion metrics
 * @returns {Promise<Object>} - Conversion metrics
 */
const getConversionMetrics = async () => {
  try {
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    const lostLeads = await Lead.countDocuments({ status: 'lost' });
    
    return {
      totalLeads,
      convertedLeads,
      lostLeads,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    };
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
};

/**
 * Get lead score distribution
 * @returns {Promise<Array>} - Score distribution data
 */
const getLeadScoreDistribution = async () => {
  try {
    const distribution = await Lead.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$leadScore', 20] }, then: '0-20' },
                { case: { $lte: ['$leadScore', 40] }, then: '21-40' },
                { case: { $lte: ['$leadScore', 60] }, then: '41-60' },
                { case: { $lte: ['$leadScore', 80] }, then: '61-80' },
                { case: { $lte: ['$leadScore', 100] }, then: '81-100' }
              ],
              default: 'unknown'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return distribution;
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
};

/**
 * Get interaction counts by channel
 * @returns {Promise<Object>} - Channel counts
 */
const getInteractionChannelCounts = async () => {
  try {
    const counts = await Interaction.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 } } }
    ]);
    
    // Convert to a more usable format
    const result = {};
    counts.forEach(item => {
      result[item._id] = item.count;
    });
    
    return result;
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
};

/**
 * Get leads created over time
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} - Time series data
 */
const getLeadsOverTime = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const leads = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format for chart display
    return leads.map(item => ({
      date: `${item._id.year}-${item._id.month}-${item._id.day}`,
      count: item.count
    }));
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
};

/**
 * Get recent leads
 * @param {number} limit - Number of leads to return
 * @returns {Promise<Array>} - Recent leads
 */
const getRecentLeads = async (limit = 5) => {
  try {
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return leads;
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
};

/**
 * Get recent interactions
 * @param {number} limit - Number of interactions to return
 * @returns {Promise<Array>} - Recent interactions
 */
const getRecentInteractions = async (limit = 5) => {
  try {
    const interactions = await Interaction.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('leadId', 'name email');
    
    // Format for frontend display
    return interactions.map(interaction => ({
      _id: interaction._id,
      leadId: interaction.leadId?._id,
      leadName: interaction.leadId?.name || 'Unknown Lead',
      channel: interaction.channel,
      direction: interaction.direction,
      content: interaction.content,
      timestamp: interaction.timestamp
    }));
  } catch (error) {
    console.error('Analytics error:', error);
    throw error;
  }
};

/**
 * Get lead counts by status and activity metrics
 * @returns {Promise<Object>} - Dashboard data
 */
const getDashboardData = async () => {
  try {
    const [
      statusCounts,
      sourceDistribution,
      conversionMetrics,
      scoreDistribution,
      channelCounts,
      recentLeadsData,
      recentInteractionsData
    ] = await Promise.all([
      getLeadStatusCounts(),
      getLeadSourceCounts(),
      getConversionMetrics(),
      getLeadScoreDistribution(),
      getInteractionChannelCounts(),
      getRecentLeads(5),
      getRecentInteractions(5)
    ]);
    
    // Calculate total and active leads
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0) || 0;
    const qualified = statusCounts['qualified'] || 0;
    const converted = statusCounts['converted'] || 0;
    
    // Get today's new leads (if any)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await Lead.countDocuments({ createdAt: { $gte: today } });
    
    // Calculate active conversations and unread messages
    const activeConversations = await Lead.countDocuments({ 
      status: { $nin: ['converted', 'lost'] },
      lastInteraction: { $ne: null }
    });
    
    const unreadMessages = await Interaction.countDocuments({
      direction: 'inbound',
      read: false
    });
    
    return {
      leadCounts: {
        total,
        qualified,
        converted,
        activeConversations,
        newToday,
        unreadMessages
      },
      leadsByStatus: statusCounts,
      leadsBySource: sourceDistribution,
      conversions: conversionMetrics,
      scoreDistribution,
      channelEngagement: channelCounts,
      recentLeads: recentLeadsData,
      recentInteractions: recentInteractionsData,
      timelineData: recentLeadsData
    };
  } catch (error) {
    console.error('Dashboard data error:', error);
    throw error;
  }
};

module.exports = {
  getLeadStatusCounts,
  getLeadSourceCounts,
  getConversionMetrics,
  getLeadScoreDistribution,
  getInteractionChannelCounts,
  getLeadsOverTime,
  getRecentLeads,
  getRecentInteractions,
  getDashboardData
}; 