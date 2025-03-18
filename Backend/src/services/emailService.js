const nodemailer = require('nodemailer');
const Interaction = require('../models/Interaction');

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email to a lead
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} message - Email message body
 * @param {string} leadId - ID of the lead
 * @returns {Promise} - Email send result
 */
const sendEmail = async (to, subject, message, leadId) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@example.com',
      to,
      subject,
      html: message
    };

    const result = await transporter.sendMail(mailOptions);
    
    // Log interaction in database if leadId is provided
    if (leadId) {
      await new Interaction({
        leadId,
        channel: 'email',
        direction: 'outbound',
        content: message,
        sentiment: 0, // Neutral sentiment as default
        intentScore: 0 // No intent score for outbound messages
      }).save();
    }
    
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

/**
 * Parse incoming email
 * @param {Object} emailData - Email data from webhook
 * @returns {Promise} - Processed email result
 */
const processIncomingEmail = async (emailData) => {
  try {
    const { from, subject, text, leadId } = emailData;
    
    // Log interaction in database
    const interaction = await new Interaction({
      leadId,
      channel: 'email',
      direction: 'inbound',
      content: text,
      sentiment: 0, // Will be updated by AI analysis later
      intentScore: 0 // Will be updated by AI analysis later
    }).save();
    
    return interaction;
  } catch (error) {
    console.error('Email processing error:', error);
    throw error;
  }
};

module.exports = { sendEmail, processIncomingEmail }; 