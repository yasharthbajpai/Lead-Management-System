const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');
const { sendWhatsAppMessage } = require('../services/whatsappService');
const { sendEmail } = require('../services/emailService');

/**
 * Send a WhatsApp message to a lead
 * POST /api/messaging/whatsapp
 */
router.post('/whatsapp', auth, async (req, res) => {
  try {
    const { leadId, message } = req.body;
    
    if (!leadId || !message) {
      return res.status(400).json({ message: 'Lead ID and message are required' });
    }
    
    // Find the lead to get their phone number
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    if (!lead.phone) {
      return res.status(400).json({ message: 'Lead does not have a phone number' });
    }
    
    // Send the WhatsApp message
    const result = await sendWhatsAppMessage(lead.phone, message, leadId);
    
    res.status(200).json({ 
      message: 'WhatsApp message sent successfully',
      messageSid: result.sid,
      status: result.status
    });
    
  } catch (err) {
    console.error('WhatsApp message error:', err);
    res.status(500).json({ 
      message: 'Failed to send WhatsApp message', 
      error: err.message,
      code: err.code
    });
  }
});

/**
 * Send an email to a lead
 * POST /api/messaging/email
 */
router.post('/email', auth, async (req, res) => {
  try {
    const { leadId, subject, message } = req.body;
    
    if (!leadId || !subject || !message) {
      return res.status(400).json({ message: 'Lead ID, subject, and message are required' });
    }
    
    // Find the lead to get their email address
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    if (!lead.email) {
      return res.status(400).json({ message: 'Lead does not have an email address' });
    }
    
    // Add tracking pixel to email
    const trackingPixel = `<img src="${process.env.BACKEND_URL || 'http://localhost:3000'}/api/webhooks/email-tracker/${leadId}/${Date.now()}" width="1" height="1" />`;
    const htmlMessage = `${message}<br/><br/>${trackingPixel}`;
    
    // Send the email
    const result = await sendEmail(lead.email, subject, htmlMessage, leadId);
    
    res.status(200).json({ 
      message: 'Email sent successfully',
      messageId: result.messageId
    });
    
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(500).json({ 
      message: 'Failed to send email', 
      error: err.message 
    });
  }
});

module.exports = router; 