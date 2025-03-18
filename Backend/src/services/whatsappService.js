const twilio = require('twilio');
const Interaction = require('../models/Interaction');
const Lead = require('../models/Lead');
const { scoreNewLead } = require('./leadScoringService');

// Twilio configuration for WhatsApp
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Format phone number for WhatsApp
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone number
 */
const formatPhoneForWhatsApp = (phone) => {
  // Clean the phone number
  let formattedPhone = phone.replace(/\s+/g, '');
  
  // Ensure it starts with a plus sign
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+${formattedPhone}`;
  }
  
  return formattedPhone;
};

/**
 * Send a WhatsApp message to a lead using Twilio
 * @param {string} phone - Recipient phone number
 * @param {string} message - Message content
 * @param {string} leadId - ID of the lead
 * @returns {Promise} - Message send result
 */
const sendWhatsAppMessage = async (phone, message, leadId) => {
  try {
    // Format the phone number to ensure it works with Twilio
    const formattedPhone = formatPhoneForWhatsApp(phone);
    
    console.log(`Sending WhatsApp message to ${formattedPhone}...`);
    
    // Send message via Twilio WhatsApp
    const response = await twilioClient.messages.create({
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${formattedPhone}`,
      body: message
    });
    
    console.log(`WhatsApp message sent successfully. SID: ${response.sid}, Status: ${response.status}`);
    
    // Log interaction in database if leadId is provided
    if (leadId) {
      await new Interaction({
        leadId,
        channel: 'whatsapp',
        direction: 'outbound',
        content: message,
        sentiment: 0, // Neutral sentiment as default
        intentScore: 0, // No intent score for outbound messages
        metadata: {
          messageId: response.sid,
          status: response.status
        }
      }).save();
      
      // Update lead's last interaction timestamp
      await Lead.findByIdAndUpdate(leadId, {
        lastInteraction: new Date(),
        lastInteractionChannel: 'whatsapp'
      });
    }
    
    return response;
  } catch (error) {
    console.error('WhatsApp message error:', error);
    throw error;
  }
};

/**
 * Handle incoming WhatsApp webhook from Twilio
 * @param {Object} webhookData - Webhook payload from Twilio
 * @returns {Promise} - Processing result
 */
const handleWhatsAppWebhook = async (webhookData) => {
  try {
    // Extract relevant information from Twilio webhook
    const {
      From: from,
      Body: messageContent,
      SmsSid: messageSid,
      SmsStatus: messageStatus
    } = webhookData;
    
    // Extract phone number from the WhatsApp format (remove 'whatsapp:' prefix)
    const phoneNumber = from.replace('whatsapp:', '');
    
    // Check if lead exists with this phone number
    let lead = await Lead.findOne({ phone: phoneNumber });
    
    // Create new lead if not found
    if (!lead) {
      lead = await new Lead({
        name: 'WhatsApp User', // Placeholder name
        email: `whatsapp_${phoneNumber.replace(/\+/g, '')}@placeholder.com`, // Placeholder email
        phone: phoneNumber,
        source: 'whatsapp',
        initialMessage: messageContent,
        status: 'new'
      }).save();
      
      // Score the new lead
      await scoreNewLead(lead._id);
    }
    
    // Log interaction
    const interaction = await new Interaction({
      leadId: lead._id,
      channel: 'whatsapp',
      direction: 'inbound',
      content: messageContent,
      metadata: {
        messageId: messageSid,
        status: messageStatus
      }
    }).save();
    
    return { lead, interaction };
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    throw error;
  }
};

/**
 * Verify Twilio webhook signature
 * @param {string} signature - X-Twilio-Signature header
 * @param {string} url - Full URL of the webhook
 * @param {Object} params - Request body or query parameters
 * @returns {boolean} - Whether the request is valid
 */
const verifyWebhook = (signature, url, params) => {
  try {
    const requestValidator = new twilio.RequestValidator(process.env.TWILIO_AUTH_TOKEN);
    return requestValidator.validate(url, params, signature);
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
};

module.exports = { sendWhatsAppMessage, handleWhatsAppWebhook, verifyWebhook }; 