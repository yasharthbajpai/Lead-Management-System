const express = require('express');
const router = express.Router();
const { handleWhatsAppWebhook, verifyWebhook } = require('../services/whatsappService');
const { processIncomingEmail } = require('../services/emailService');

// Add parser for Twilio's form-urlencoded webhooks
router.use(express.urlencoded({ extended: false }));

/**
 * Twilio WhatsApp webhook handler
 * Handles incoming messages from WhatsApp via Twilio
 */
router.post('/whatsapp', async (req, res) => {
  try {
    console.log('Received Twilio webhook request');
    
    // Verify the request is coming from Twilio
    const twilioSignature = req.headers['x-twilio-signature'];
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    let isValidRequest = true; // Default to true for testing
    
    if (twilioSignature) {
      isValidRequest = verifyWebhook(twilioSignature, requestUrl, req.body);
      console.log(`Webhook signature verification: ${isValidRequest ? 'Valid' : 'Invalid'}`);
    } else {
      console.log('No Twilio signature found - skipping verification (likely a test request)');
    }
    
    if (!isValidRequest && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Invalid request signature' });
    }
    
    // Log the body for debugging
    console.log('Webhook payload:', req.body);
    
    // Process the incoming message
    const result = await handleWhatsAppWebhook(req.body);
    console.log('Webhook processed successfully:', result);
    
    // Return TwiML response
    res.set('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <!-- You can include a reply here if you want an automatic response -->
        <!-- <Message>Thank you for your message! Our team will respond shortly.</Message> -->
      </Response>
    `);
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    res.status(500).json({ message: 'Error processing WhatsApp message' });
  }
});

/**
 * Email webhook handler
 * Handles incoming emails from your email provider
 */
router.post('/email', async (req, res) => {
  try {
    // Process the incoming email
    // Note: The structure of the request body will depend on your email provider's webhook format
    const result = await processIncomingEmail(req.body);
    res.status(200).json({ message: 'Email processed successfully', id: result._id });
  } catch (err) {
    console.error('Email webhook error:', err);
    res.status(500).json({ message: 'Error processing email' });
  }
});

/**
 * Email tracking pixel handler
 * Tracks when a lead opens an email
 */
router.get('/email-tracker/:leadId/:messageId', async (req, res) => {
  try {
    const { leadId, messageId } = req.params;
    
    // Log the email open event
    // You can call your interaction tracking service here
    
    // Return a 1x1 transparent pixel
    res.set('Content-Type', 'image/gif');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  } catch (err) {
    console.error('Email tracking error:', err);
    res.status(500).end();
  }
});

module.exports = router; 