# Lead Management System

A comprehensive lead management system with multi-channel communication capabilities (WhatsApp, Email), designed to help businesses track, nurture, and convert leads efficiently.

## Features

- **Multi-channel Communication**: Seamlessly communicate with leads via WhatsApp and Email
- **Lead Tracking**: Monitor lead status, interactions, and conversion metrics
- **Analytics Dashboard**: Visual representation of lead metrics and performance
- **AI Insights**: Get automated insights on lead behavior and engagement
- **WhatsApp Integration**: Powered by Twilio WhatsApp Business API
- **Email Tracking**: Track email opens and engagement
- **User Management**: User authentication and role-based access control

## Project Structure

```
AA project/
├── Backend/               # Node.js Express backend
│   ├── src/               # Source code
│   │   ├── models/        # Mongoose database models
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── server.js      # Main server file
│   ├── .env               # Environment variables
│   └── package.json       # Node dependencies
│
└── Frontend/              # React frontend
    ├── src/               # Source code
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Application pages
    │   ├── services/      # API services
    │   └── App.jsx        # Main application component
    ├── public/            # Static assets
    └── package.json       # React dependencies
```

## Backend Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Twilio account with WhatsApp Business API access

### Installation

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory with the following variables:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Connection
   MONGODB_URI=your_mongodb_connection_string

   # Session Secret
   SESSION_SECRET=your_session_secret

   # Twilio Configuration for WhatsApp
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

The backend server will run on `http://localhost:3000`.

### Testing Twilio WhatsApp Integration

1. Test sending a WhatsApp message:
   ```bash
   node test-twilio.js
   ```
   (Make sure to replace the test recipient phone number in the file first)

2. Test webhook handling (with server running):
   ```bash
   node test-webhook.js
   ```

## Frontend Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Frontend directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend application will run on `http://localhost:5000`.

## WhatsApp Integration Setup

The system uses Twilio's WhatsApp Business API for WhatsApp messaging. Follow these steps to set up:

1. Create a Twilio account at [twilio.com](https://www.twilio.com)
2. Navigate to the Twilio Console
3. Go to Messaging > Try it Out > Send a WhatsApp Message
4. Set up your WhatsApp Sandbox following Twilio's instructions
5. Update your `.env` file with the Twilio credentials
6. For production use, configure the webhook URL in Twilio to point to:
   ```
   https://your-domain.com/api/webhooks/whatsapp
   ```

See the `TWILIO-SETUP.md` file in the Backend directory for detailed configuration instructions.

## Usage Guide

### Authentication

- Register a new account or log in with your credentials
- The system supports role-based access control

### Managing Leads

- View all leads on the Leads page
- Add new leads manually or via import
- Click on a lead to view detailed information

### Communication

- Send WhatsApp messages by clicking on the WhatsApp icon on the lead detail page
- Send emails by clicking on the Email icon
- View all conversations on the Conversations page
- Filter conversations by channel (WhatsApp, Email)

### Analytics

- View lead performance metrics on the Dashboard
- Analyze conversion rates, source effectiveness, and more
- Track individual lead engagement and interaction history

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- `/api/auth` - Authentication endpoints
- `/api/leads` - Lead management
- `/api/interactions` - Interaction logging and retrieval
- `/api/messaging` - Message sending endpoints
- `/api/webhooks` - Webhook handlers for WhatsApp and Email
- `/api/analytics` - Analytics and reporting

## Technologies Used

### Backend
- Node.js and Express
- MongoDB with Mongoose
- Twilio API for WhatsApp messaging
- Nodemailer for email
- JWT for authentication

### Frontend
- React
- Material-UI
- Chart.js for analytics
- Axios for API requests

## License

This project is licensed under the MIT License.

## Made By

Created by Yasharth Bajpai with the help of Cursor and Claude 3.7 