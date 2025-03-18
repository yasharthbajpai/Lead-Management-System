# Twilio WhatsApp Integration Setup

This document provides instructions for setting up and testing the Twilio WhatsApp integration for the Lead Management System.

## Prerequisites

1. A Twilio account (you can sign up for a free trial at https://www.twilio.com)
2. Your Twilio Account SID and Auth Token (found in the Twilio Console)
3. Node.js installed on your machine
4. The Backend server code set up with all dependencies installed

## Setup Steps

### 1. Twilio Account Configuration

1. Log in to your Twilio account at https://www.twilio.com/login
2. Navigate to the Twilio Console
3. Go to Messaging > Try it out > Send a WhatsApp Message
4. Follow the instructions to set up the WhatsApp Sandbox
5. Send the provided code from your WhatsApp to the Twilio WhatsApp number to join the sandbox

### 2. Environment Variables

Ensure your `.env` file has the following Twilio configurations:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number
```

### 3. Testing Outbound Messages

1. Open `test-twilio.js` and replace the `testRecipient` phone number with your own WhatsApp number (including country code)
2. Run the test script:

```bash
node test-twilio.js
```

3. If successful, you should receive a WhatsApp message from the Twilio number on your phone
4. Check the console output for the message details and any potential errors

### 4. Testing Inbound Messages (Webhook Handling)

#### Local Testing

1. Make sure your backend server is running:

```bash
npm start
```

2. In a new terminal window, run the webhook test script:

```bash
node test-webhook.js
```

3. This will simulate an incoming WhatsApp message and test your webhook handler
4. Check the console output to verify that the test was successful
5. Verify in your database that a new lead and interaction were created

#### Production Webhook Setup

For production use, you need to configure Twilio to send webhooks to your server:

1. Ensure your server is accessible from the internet (using a service like ngrok or by deploying to a hosting provider)
2. In the Twilio Console, go to Messaging > Settings > WhatsApp Sandbox
3. Set the "When a message comes in" webhook URL to:
   `https://your-domain.com/api/webhooks/whatsapp`
4. Save the changes

## Testing in the Sandbox Environment

Important notes about the Twilio WhatsApp Sandbox:

1. The sandbox is for testing only and has limitations
2. Your WhatsApp number must have joined the sandbox by sending the join code
3. The sandbox session expires after 72 hours of inactivity
4. Only phone numbers that have joined your sandbox can receive messages
5. Template messages may be required for some types of outbound messages

## Troubleshooting

### Common Issues:

1. **Error 21608**: Your recipient has not joined the sandbox or the session expired
   - Solution: Have the recipient rejoin the sandbox by sending the join code

2. **Webhook Not Receiving Messages**: 
   - Ensure your server is accessible from the internet
   - Check that the webhook URL is correctly set in the Twilio Console
   - Verify that your server is properly handling the webhook format

3. **Authentication Errors**:
   - Double-check your Account SID and Auth Token in the `.env` file
   - Ensure you're using the correct Twilio phone number

4. **Message Format Errors**:
   - Ensure phone numbers are formatted correctly with the country code
   - For WhatsApp, numbers should be prefixed with "whatsapp:" in the Twilio API calls

## Moving to Production

To move beyond the sandbox for production use:

1. Complete the WhatsApp Business Profile verification process in Twilio
2. Set up and get approval for your message templates
3. Update your code to use approved templates for initial messages
4. Test thoroughly with real users

For more information, refer to the [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp/api). 