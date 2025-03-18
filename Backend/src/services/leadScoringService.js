const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');

const scoreNewLead = async (leadId) => {
  try {
    // Fetch lead data
    const lead = await Lead.findById(leadId);
    const interactions = await Interaction.find({ leadId });
    
    // Prepare data for analysis
    const analysisData = {
      leadInfo: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        initialMessage: lead.initialMessage,
        status: lead.status
      },
      interactions: interactions.map(interaction => ({
        channel: interaction.channel,
        direction: interaction.direction,
        content: interaction.content,
        sentiment: interaction.sentiment,
        intentScore: interaction.intentScore
      }))
    };
    
    // Calculate base score based on various factors
    let baseScore = 0;
    
    // Source weight
    const sourceWeights = {
      'web_form': 10,
      'whatsapp': 15,
      'email': 8,
      'other': 5
    };
    baseScore += sourceWeights[lead.source] || 0;
    
    // Message content analysis
    if (lead.initialMessage) {
      // Simple keyword analysis (can be replaced with more sophisticated NLP)
      const positiveKeywords = ['interested', 'buy', 'purchase', 'price', 'cost', 'available'];
      const negativeKeywords = ['not interested', 'expensive', 'too much', 'no thanks'];
      
      const message = lead.initialMessage.toLowerCase();
      positiveKeywords.forEach(keyword => {
        if (message.includes(keyword)) baseScore += 5;
      });
      negativeKeywords.forEach(keyword => {
        if (message.includes(keyword)) baseScore -= 5;
      });
    }
    
    // Interaction analysis
    if (interactions.length > 0) {
      // For string-based sentiment
      const sentimentValue = interactions.reduce((acc, curr) => {
        if (curr.sentiment === 'positive') return acc + 1;
        if (curr.sentiment === 'negative') return acc - 1;
        return acc;
      }, 0) / interactions.length;
      
      const averageIntent = interactions.reduce((acc, curr) => acc + (curr.intentScore || 0), 0) / interactions.length;
      
      baseScore += (sentimentValue + 1) * 10; // Convert -1 to 1 range to 0 to 20
      baseScore += averageIntent * 0.5; // Convert 0 to 100 range to 0 to 50
    }
    
    // Normalize score to 0-100 range
    const finalScore = Math.min(Math.max(baseScore, 0), 100);
    
    // Update lead score
    await Lead.findByIdAndUpdate(leadId, { 
      leadScore: finalScore,
      status: finalScore > 70 ? 'qualified' : 'new'
    });
    
    // Generate insights
    const insights = {
      score: finalScore,
      factors: {
        source: sourceWeights[lead.source],
        messageAnalysis: lead.initialMessage ? 'positive' : 'neutral',
        interactionQuality: interactions.length > 0 ? 'good' : 'needs_followup'
      }
    };
    
    const recommendedActions = [
      {
        action: 'Follow Up',
        priority: finalScore > 70 ? 'high' : 'medium',
        description: finalScore > 70 
          ? 'High priority lead - immediate follow-up recommended'
          : 'Schedule follow-up within 24 hours'
      }
    ];
    
    // Save insights as an interaction
    await new Interaction({
      leadId,
      type: 'insight',
      channel: 'other',
      direction: 'outbound',
      content: 'Lead scoring insight',
      insights,
      recommendedActions
    }).save();
    
    return { score: finalScore, insights };
  } catch (error) {
    console.error('Lead scoring error:', error);
    throw error;
  }
};

module.exports = { scoreNewLead }; 