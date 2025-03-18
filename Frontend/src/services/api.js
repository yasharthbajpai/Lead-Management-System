import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  
  // Leads endpoints
  getLeads: () => api.get('/leads'),
  getLeadById: (id) => api.get(`/leads/${id}`),
  createLead: (leadData) => api.post('/leads', leadData),
  updateLead: (id, leadData) => api.patch(`/leads/${id}`, leadData),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  
  // Interactions endpoints
  getInteractionsByLeadId: (leadId) => api.get(`/interactions/lead/${leadId}`),
  createInteraction: (interactionData) => api.post('/interactions', interactionData),
  updateInteraction: (id, interactionData) => api.patch(`/interactions/${id}`, interactionData),
  deleteInteraction: (id) => api.delete(`/interactions/${id}`),
  getActiveConversations: () => api.get('/interactions/conversations'),
  
  // Messaging endpoints
  sendWhatsAppMessage: (leadId, message) => api.post('/messaging/whatsapp', { leadId, message }),
  sendEmailMessage: (leadId, subject, message) => api.post('/messaging/email', { leadId, subject, message }),
  getMessagesByConversation: (leadId, channel) => api.get(`/interactions/lead/${leadId}?channel=${channel}`),
  
  // Analytics endpoints
  getLeadStatusCounts: () => api.get('/analytics/leads/status'),
  getLeadSourceCounts: () => api.get('/analytics/leads/source'),
  getConversionMetrics: () => api.get('/analytics/conversions'),
  getLeadScoreDistribution: () => api.get('/analytics/leads/scores'),
  getInteractionChannelCounts: () => api.get('/analytics/interactions/channel'),
  getLeadsOverTime: (days = 30) => api.get(`/analytics/leads/time?days=${days}`),
  getDashboardData: () => api.get('/analytics/dashboard'),
  getRecentInsights: () => api.get('/analytics/insights/recent'),
  getLeadInsights: (leadId) => api.get(`/analytics/insights/lead/${leadId}`),
  
  // Scores endpoints
  getUserScore: () => api.get('/scores/me'),
  getLeaderboard: () => api.get('/scores/leaderboard'),
};

export default apiService; 