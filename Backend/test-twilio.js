require('dotenv').config();
const twilio = require('twilio');

// Create Twilio client using credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Verify that credentials are loaded
console.log('Testing Twilio WhatsApp integration:');
console.log('---------------------------------------');
console.log(`Account SID: ${accountSid ? '✓ Loaded' : '❌ Missing'}`);
console.log(`Auth Token: ${authToken ? '✓ Loaded' : '❌ Missing'}`);
console.log(`Phone Number: ${twilioPhoneNumber ? `✓ Loaded (${twilioPhoneNumber})` : '❌ Missing'}`);
console.log('---------------------------------------');

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Error: Missing Twilio credentials in .env file');
  process.exit(1);
}

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Test recipient phone number - REPLACE THIS WITH YOUR PHONE NUMBER
const testRecipient = '+1234567890'; // 👈 IMPORTANT: Replace with your phone number including country code before running this test

/**
 * Send a test WhatsApp message
 */
async function sendTestMessage() {
  try {
    console.log(`Sending test message to WhatsApp ${testRecipient}...`);
    
    // Format the "to" phone number properly for WhatsApp
    // No need to format the number when using WhatsApp prefix
    const formattedTo = `whatsapp:${testRecipient}`;
    
    const message = await client.messages.create({
      from: `whatsapp:${twilioPhoneNumber}`,
      to: formattedTo,
      body: 'Hello! This is a test message from your Lead Management System.'
    });
    
    console.log('✅ Message sent successfully!');
    console.log('---------------------------------------');
    console.log(`Message SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
    console.log(`From: ${message.from}`);
    console.log(`To: ${message.to}`);
    console.log(`Body: ${message.body}`);
    
    console.log('\nImportant: To receive this message, you need to have joined');
    console.log('the Twilio WhatsApp Sandbox. If you haven\'t done this yet,');
    console.log('please follow the instructions from Twilio to connect your');
    console.log('WhatsApp account to the sandbox.');
    
  } catch (error) {
    console.error('❌ Error sending message:');
    console.error(error);
    
    if (error.code === 21608) {
      console.log('\nThis error commonly occurs when:');
      console.log('1. Your phone number has not joined the Twilio Sandbox');
      console.log('2. The sandbox is not active');
      console.log('3. It has been more than 24 hours since you last messaged the sandbox');
      console.log('\nTo fix this:');
      console.log('1. Go to the Twilio Console > Messaging > Try it Out > Send a WhatsApp Message');
      console.log('2. Follow the instructions to join the sandbox by sending the provided code to the WhatsApp number');
    } else if (error.code === 21211) {
      console.log('\nInvalid phone number format. Please make sure your phone number:');
      console.log('1. Includes the country code (e.g., +1 for USA)');
      console.log('2. Contains only digits and the plus sign');
      console.log('3. Is a valid, working phone number');
      console.log('\nExample of a correct format: +1XXXXXXXXXX for US numbers');
    }
  }
}

// Run the test
sendTestMessage(); 