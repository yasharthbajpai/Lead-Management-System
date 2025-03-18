const axios = require('axios');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');
const { sendEmail } = require('./emailService');
const { sendWhatsAppMessage } = require('./whatsappService');

/**
 * Generate a personalized message using Perplexity API
 * @param {string} leadId - Lead ID
 * @param {string} channel - Communication channel (email, whatsapp)
 * @returns {Promise<string>} - Generated message
 */
const generatePersonalizedMessage = async (leadId, channel) => {
  try {
    // Fetch lead data
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    // Fetch lead interactions
    const interactions = await Interaction.find({ leadId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    // Prepare data for Perplexity API
    const promptData = {
      leadInfo: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        initialMessage: lead.initialMessage,
        leadScore: lead.leadScore,
        status: lead.status,
        tags: lead.tags
      },
      interactions: interactions.map(int => ({
        channel: int.channel,
        direction: int.direction,
        content: int.content,
        timestamp: int.timestamp
      })),
      context: {
        channel: channel,
        purpose: 'lead_nurturing'
      }
    };
    
    // In a real implementation, use Perplexity API here
    // For now, simulating API call with a reasonable fallback
    
    // Make sure PERPLEXITY_API_KEY and endpoint are set in .env
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.perplexity.ai/chat/completions',
          {
            model: 'pplx-7b-chat',
            messages: [
              { 
                role: 'system', 
                content: `You are a personalized marketing assistant. Generate a personalized ${channel} message for a lead with the following information. The message should be friendly, professional, and persuasive. For email messages, include a subject line separated by "---SUBJECT---" at the beginning.` 
              },
              { role: 'user', content: JSON.stringify(promptData) }
            ],
            max_tokens: 300
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
            }
          }
        );
        
        return response.data.choices[0].message.content;
      } catch (apiError) {
        console.error('Perplexity API error:', apiError);
        // Fall back to template message if API fails
      }
    }
    
    // Fallback message templates if API is not available
    if (channel === 'email') {
      return `---SUBJECT---Following up on your interest\n\nHi ${lead.name},\n\nThank you for your interest in our services. We noticed you reached out to us recently and wanted to follow up to see if you have any questions or if there's anything we can help you with.\n\nLooking forward to hearing from you.\n\nBest regards,\nThe Team`;
    } else if (channel === 'whatsapp') {
      return `Hi ${lead.name}, thank you for your interest in our services. Is there anything specific you'd like to know more about? We're here to help!`;
    } else {
      return `Hello ${lead.name}, thank you for reaching out. How can we assist you today?`;
    }
  } catch (error) {
    console.error('Message generation error:', error);
    throw error;
  }
};

/**
 * Send personalized outreach to a lead
 * @param {string} leadId - Lead ID
 * @param {string} channel - Communication channel (email, whatsapp)
 * @returns {Promise<Object>} - Outreach result
 */
const sendPersonalizedOutreach = async (leadId, channel) => {
  try {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    const message = await generatePersonalizedMessage(leadId, channel);
    let result;
    
    if (channel === 'email') {
      // Parse subject and message from the generated content
      const parts = message.split('---SUBJECT---');
      const subject = parts.length > 1 ? parts[1].split('\n')[0].trim() : 'Following up on your interest';
      const emailBody = parts.length > 1 ? parts[1].substring(parts[1].indexOf('\n')).trim() : message;
      
      result = await sendEmail(lead.email, subject, emailBody, leadId);
    } else if (channel === 'whatsapp') {
      result = await sendWhatsAppMessage(lead.phone, message, leadId);
    } else {
      throw new Error(`Unsupported channel: ${channel}`);
    }
    
    // Update lead status
    lead.status = 'contacted';
    await lead.save();
    
    return { 
      success: true, 
      message: `Outreach sent successfully via ${channel}`,
      result 
    };
  } catch (error) {
    console.error('Outreach error:', error);
    throw error;
  }
};

module.exports = { 
  generatePersonalizedMessage,
  sendPersonalizedOutreach
}; 