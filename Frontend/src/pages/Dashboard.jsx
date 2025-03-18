import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Chat as ChatIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Leaderboard as LeaderboardIcon
} from '@mui/icons-material';
import apiService from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Transform data for pie chart
const transformStatusData = (statusData) => {
  if (!statusData) return [];
  return Object.entries(statusData).map(([name, value]) => ({ name, value }));
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    leadCounts: {},
    leadsByStatus: [],
    scoreDistribution: [],
    recentLeads: [],
    recentInteractions: [],
    channelEngagement: {},
    conversions: {},
    topPerformers: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardData();
      
      // Process the data from the backend
      let processedData = {
        leadCounts: {
          total: 0,
          qualified: 0,
          converted: 0,
          activeConversations: 0,
          newToday: 0,
          unreadMessages: 0
        },
        leadsByStatus: [],
        leadsByScore: [],
        recentLeads: [],
        recentInteractions: [],
        activityTimeline: []
      };

      // Extract data from response
      if (response.data) {
        // Transform status data for pie chart
        if (response.data.leadsByStatus) {
          processedData.leadsByStatus = transformStatusData(response.data.leadsByStatus);
          
          // Calculate totals for the summary cards
          processedData.leadCounts.total = Object.values(response.data.leadsByStatus).reduce((sum, count) => sum + count, 0);
          processedData.leadCounts.qualified = response.data.leadsByStatus.qualified || 0;
          processedData.leadCounts.converted = response.data.leadsByStatus.converted || 0;
        }
        
        // Get conversion metrics if available
        if (response.data.conversions) {
          processedData.leadCounts.total = response.data.conversions.totalLeads || 0;
          processedData.leadCounts.converted = response.data.conversions.convertedLeads || 0;
        }
        
        // Process score distribution
        if (response.data.scoreDistribution) {
          processedData.leadsByScore = response.data.scoreDistribution.map(item => ({
            range: item._id,
            count: item.count
          }));
        }
        
        // Process recent leads
        if (response.data.recentLeads) {
          processedData.recentLeads = response.data.recentLeads;
        }
        
        // Use any time-series data for activity timeline
        if (response.data.recentLeads && Array.isArray(response.data.recentLeads)) {
          processedData.activityTimeline = response.data.recentLeads.map(item => ({
            date: item.date || "N/A",
            leads: item.count || 0,
            interactions: 0
          }));
        }
      }
      
      setDashboardData(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'qualified':
        return 'primary';
      case 'contacted':
        return 'warning';
      case 'converted':
        return 'success';
      case 'lost':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMessageIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <EmailIcon fontSize="small" color="primary" />;
      case 'whatsapp':
        return <WhatsAppIcon fontSize="small" color="success" />;
      default:
        return <ChatIcon fontSize="small" />;
    }
  };

  const formatDateToHours = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Empty data message component
  const EmptyDataMessage = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 200,
      flexDirection: 'column',
      gap: 2
    }}>
      <Typography variant="body1" color="text.secondary">
        No data available yet
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/leads/new')}
      >
        Add Your First Lead
      </Button>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Leads
              </Typography>
              <Typography variant="h3" component="div">
                {dashboardData.leadCounts.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.leadCounts.newToday || 0} new today
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/leads')}>View All Leads</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Qualified Leads
              </Typography>
              <Typography variant="h3" component="div" color="primary.main">
                {dashboardData.leadCounts.qualified || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.leadCounts.total ? 
                  ((dashboardData.leadCounts.qualified / dashboardData.leadCounts.total) * 100).toFixed(1) : 0}% of total
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/leads?status=qualified')}>View Qualified</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Converted
              </Typography>
              <Typography variant="h3" component="div" color="success.main">
                {dashboardData.leadCounts.converted || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.leadCounts.total ?
                  ((dashboardData.leadCounts.converted / dashboardData.leadCounts.total) * 100).toFixed(1) : 0}% conversion rate
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/leads?status=converted')}>View Converted</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Conversations
              </Typography>
              <Typography variant="h3" component="div" color="warning.main">
                {dashboardData.leadCounts.activeConversations || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.leadCounts.unreadMessages || 0} unread messages
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/conversations')}>View Conversations</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Status Distribution
            </Typography>
            {dashboardData.leadsByStatus && dashboardData.leadsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={dashboardData.leadsByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {dashboardData.leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyDataMessage />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Score Distribution
            </Typography>
            {dashboardData.leadsByScore && dashboardData.leadsByScore.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={dashboardData.leadsByScore}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Leads" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyDataMessage />
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Activity Timeline */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Activity Timeline
        </Typography>
        {dashboardData.activityTimeline && dashboardData.activityTimeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dashboardData.activityTimeline}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="leads" 
                name="New Leads" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="interactions" 
                name="Interactions" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyDataMessage />
        )}
      </Paper>
      
      {/* Recent Data */}
      <Grid container spacing={3}>
        {/* Recent Leads */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Leads
              </Typography>
              <Button variant="text" size="small" onClick={() => navigate('/leads')}>
                View All
              </Button>
            </Box>
            
            {dashboardData.recentLeads && dashboardData.recentLeads.length > 0 ? (
              <Box>
                {dashboardData.recentLeads.map((lead, index) => (
                  <Box key={lead._id || index}>
                    <Box sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {lead.name || "Unnamed Lead"}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={(lead.status || "new").charAt(0).toUpperCase() + (lead.status || "new").slice(1)} 
                          color={getStatusColor(lead.status || "new")}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Lead Score:
                        </Typography>
                        <LeaderboardIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {lead.leadScore || 0}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {lead.initialMessage || "No initial message"}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => navigate(`/leads/${lead._id || "new"}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>
                    <Divider />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No recent leads available
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Interactions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Interactions
              </Typography>
              <Button variant="text" size="small" onClick={() => navigate('/conversations')}>
                View All
              </Button>
            </Box>
            
            {dashboardData.recentInteractions && dashboardData.recentInteractions.length > 0 ? (
              <Box>
                {dashboardData.recentInteractions.map((interaction, index) => (
                  <Box key={interaction._id || index}>
                    <Box sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, mr: 1 }}>
                            {interaction.leadName || "Unknown Lead"}
                          </Typography>
                          {getMessageIcon(interaction.channel || "other")}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateToHours(interaction.timestamp)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 500 }}>
                          {interaction.direction === 'inbound' ? 'Received: ' : 'Sent: '}
                        </Box>
                        {interaction.content && interaction.content.length > 100 
                          ? `${interaction.content.substring(0, 100)}...` 
                          : (interaction.content || "No content")}
                      </Typography>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => navigate(`/leads/${interaction.leadId || "new"}`)}
                      >
                        View Lead
                      </Button>
                    </Box>
                    <Divider />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No recent interactions available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 