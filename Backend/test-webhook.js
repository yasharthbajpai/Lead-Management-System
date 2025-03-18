require('dotenv').config();
const axios = require('axios');
const querystring = require('querystring');

// Configuration
const API_URL = 'http://localhost:3000'; // Change if you're using a different port
const WEBHOOK_PATH = '/api/webhooks/whatsapp';

// Use a valid phone number format for testing
const testSenderPhone = '+1234567890'; // 👈 IMPORTANT: Replace with a test phone number including country code

/**
 * Test the WhatsApp webhook with a simulated Twilio message
 */
async function testWebhook() {
  console.log('Testing WhatsApp webhook handling:');
  console.log('---------------------------------------');
  
  try {
    // Check if server is running
    console.log(`Checking if server is running at ${API_URL}...`);
    try {
      await axios.get(`${API_URL}/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.error('❌ Server is not running. Please start your server first with "npm start"');
      process.exit(1);
    }
    
    // Simulate a Twilio webhook payload for an incoming WhatsApp message
    const webhookPayload = {
      SmsMessageSid: 'SM' + generateRandomId(),
      SmsSid: 'SM' + generateRandomId(),
      SmsStatus: 'received',
      From: `whatsapp:${testSenderPhone}`,
      To: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      Body: 'Hello, this is a test message from the webhook simulator!',
      NumMedia: '0',
      NumSegments: '1',
      MessageSid: 'SM' + generateRandomId(),
      AccountSid: process.env.TWILIO_ACCOUNT_SID,
      ApiVersion: '2010-04-01'
    };
    
    console.log(`Sending simulated webhook to ${API_URL}${WEBHOOK_PATH}...`);
    console.log('---------------------------------------');
    console.log('Webhook payload:');
    console.log(JSON.stringify(webhookPayload, null, 2));
    console.log('---------------------------------------');
    
    // Convert payload to form-urlencoded format as Twilio would send it
    const formData = querystring.stringify(webhookPayload);
    
    // Send the simulated webhook
    const response = await axios.post(`${API_URL}${WEBHOOK_PATH}`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': formData.length
      }
    });
    
    console.log('✅ Webhook successfully processed!');
    console.log('---------------------------------------');
    console.log(`Status: ${response.status}`);
    console.log(`Response data:`, response.data);
    
    console.log('\nNote: If successful, this test should have:');
    console.log('1. Created a new lead in your database (if the phone number doesn\'t exist)');
    console.log('2. Logged an interaction for the incoming message');
    console.log('3. You can check these in your MongoDB database');
    
  } catch (error) {
    console.error('❌ Error testing webhook:');
    if (error.response) {
      // The request was made and the server responded with a non-2xx status code
      console.error(`HTTP Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is your server running?');
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
  }
}

/**
 * Generate a random ID for simulating Twilio message IDs
 */
function generateRandomId(length = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Run the test
testWebhook(); 