# AI-Driven Lead Conversation System - Frontend

The frontend application for the AI-Driven Lead Conversation System, a platform that captures leads from multiple channels, scores them using AI, and enables personalized outreach.

## Features

- **Dashboard**: Real-time overview of lead metrics, conversions, and activities
- **Lead Management**: View, search, filter, and manage leads from various sources
- **Conversations**: Chat interface for WhatsApp and email communications with leads
- **Analytics**: Detailed charts and metrics for lead performance analysis
- **AI Insights**: AI-powered lead scoring and conversation analysis
- **Settings**: Configure API keys, notification preferences, and system settings

## Tech Stack

- **React**: Frontend library for building user interfaces
- **React Router**: For client-side routing and navigation
- **Material-UI**: Component library for consistent design
- **Recharts**: Composable charting library for data visualization
- **Formik & Yup**: Form handling and validation
- **Axios**: HTTP client for API requests
- **date-fns**: Date utilities for formatting and manipulation

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Backend API should be running (see backend README)

### Installation

1. Clone the repository
2. Navigate to the Frontend directory
```bash
cd Frontend
```

3. Install dependencies
```bash
npm install
```

4. Create an `.env` file in the root directory and add the following:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server
```bash
npm run dev
```

6. The application will be available at `http://localhost:5173`

## Project Structure

```
Frontend/
├── public/             # Static assets
├── src/                # Source code
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Entry point
├── .env                # Environment variables
└── package.json        # Dependencies and scripts
```

## Build for Production

```bash
npm run build
```

The build files will be output to the `dist` directory, ready to be deployed to a static hosting service.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build locally

## Authentication

The application uses JWT (JSON Web Token) authentication. The token is stored in localStorage and automatically included in API requests.

## License

[MIT](LICENSE)

## Acknowledgements

This project was built using [Vite](https://vitejs.dev/), a modern frontend build tool that provides faster and leaner development experience.
