# AI-Driven Lead Conversation System - Backend

This is the backend component of the AI-Driven Lead Conversation System. It captures leads from multiple sources, scores them using AI, and enables personalized outreach through various communication channels.

## Features

- Multi-channel lead capture (web forms, WhatsApp)
- AI-based lead scoring and prioritization
- Personalized outreach via email and WhatsApp
- Lead analytics and insights
- RESTful API for frontend integration

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Perplexity API for AI capabilities
- WhatsApp Business API
- Nodemailer for email communication

## Getting Started

### Prerequisites

- Node.js 14+ installed
- MongoDB instance (local or cloud)
- Perplexity API key
- WhatsApp Business API credentials (for WhatsApp integration)
- SMTP server access (for email communication)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/lead-conversion-system.git
cd lead-conversion-system/Backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment variables
```bash
cp .env.example .env
```
Edit the `.env` file with your specific configuration variables.

4. Start the development server
```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 5000).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/change-password` - Change user password

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get a specific lead
- `POST /api/leads` - Create a new lead
- `PATCH /api/leads/:id` - Update a lead
- `DELETE /api/leads/:id` - Delete a lead

### Interactions
- `GET /api/interactions/lead/:leadId` - Get interactions for a specific lead
- `POST /api/interactions` - Create a new interaction
- `PATCH /api/interactions/:id` - Update an interaction
- `DELETE /api/interactions/:id` - Delete an interaction

### Insights
- `GET /api/insights` - Get all insights
- `GET /api/insights/lead/:leadId` - Get insights for a specific lead
- `GET /api/insights/:id` - Get a specific insight
- `POST /api/insights` - Create a new insight
- `DELETE /api/insights/:id` - Delete an insight

### Engagement
- `POST /api/engagement/:leadId` - Send outreach to a lead
- `POST /api/engagement/:leadId/preview` - Preview outreach message

### Analytics
- `GET /api/analytics/leads/status` - Get lead status distribution
- `GET /api/analytics/leads/source` - Get lead source distribution
- `GET /api/analytics/conversions` - Get conversion metrics
- `GET /api/analytics/leads/scores` - Get lead score distribution
- `GET /api/analytics/interactions/channel` - Get interaction channel distribution
- `GET /api/analytics/leads/time` - Get leads over time
- `GET /api/analytics/dashboard` - Get dashboard summary data

### Webhooks
- `GET /api/webhooks/whatsapp` - WhatsApp verification webhook
- `POST /api/webhooks/whatsapp` - WhatsApp incoming message webhook
- `POST /api/webhooks/email` - Email incoming message webhook

## Testing

Run tests using Jest:
```bash
npm test
```

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Perplexity API](https://perplexity.ai/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/)

## User Scoring System

The system includes a comprehensive scoring mechanism that rewards users for their activities:

### Scoring Points

- **Login**: 50 points
- **Creating a Lead**: 30 points
- **Updating a Lead**: 15 points
- **Creating an Interaction**: 25 points
- **Other Activities**: 5 points

### How Scoring Works

1. Users automatically receive points when they perform actions in the system
2. Each activity is recorded with a timestamp, description, and points
3. The total score accumulates over time and is never reset
4. The system maintains a leaderboard of top performers

### Viewing Scores

- Users can view their own score via the `/api/scores/me` endpoint
- Managers and admins can view the leaderboard via `/api/scores/leaderboard`
- Detailed activity analytics are available through the analytics dashboard

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user and receive a session
- `POST /api/auth/logout` - Log out and destroy session
- `GET /api/auth/me` - Get current user profile

### Scores

- `GET /api/scores/me` - Get current user's score and activities
- `GET /api/scores/leaderboard` - Get top users by score
- `GET /api/scores/user/:userId` - Get a specific user's score (admin/manager only)

### Analytics

- `GET /api/analytics/users/top` - Get top performing users
- `GET /api/analytics/users/activity` - Get user activity summary

## Dependencies

- express
- mongoose
- express-session
- connect-mongo
- bcryptjs
- cors
- dotenv 