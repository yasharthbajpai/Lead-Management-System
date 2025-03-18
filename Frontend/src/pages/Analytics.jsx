import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
import apiService from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4CAF50', '#2196F3'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [conversionData, setConversionData] = useState({});
  const [scoreData, setScoreData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    fetchTimelineData(timeRange);
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        statusResponse,
        sourceResponse,
        conversionResponse,
        scoreResponse,
        channelResponse,
        timelineResponse
      ] = await Promise.all([
        apiService.getLeadStatusCounts(),
        apiService.getLeadSourceCounts(),
        apiService.getConversionMetrics(),
        apiService.getLeadScoreDistribution(),
        apiService.getInteractionChannelCounts(),
        apiService.getLeadsOverTime(30)
      ]);
      
      // Process status data
      setStatusData(
        Object.entries(statusResponse.data).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        }))
      );
      
      // Process source data
      setSourceData(
        Object.entries(sourceResponse.data).map(([source, count]) => ({
          name: source.replace('_', ' ').charAt(0).toUpperCase() + source.replace('_', ' ').slice(1),
          value: count
        }))
      );
      
      // Set conversion metrics
      setConversionData(conversionResponse.data);
      
      // Set score distribution
      setScoreData(scoreResponse.data);
      
      // Process channel data
      setChannelData(
        Object.entries(channelResponse.data).map(([channel, count]) => ({
          name: channel.charAt(0).toUpperCase() + channel.slice(1),
          value: count
        }))
      );
      
      // Set timeline data
      setTimelineData(timelineResponse.data);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimelineData = async (days) => {
    try {
      const response = await apiService.getLeadsOverTime(days);
      setTimelineData(response.data);
    } catch (err) {
      console.error('Error fetching timeline data:', err);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
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

  // Calculate conversion rate display
  const conversionRateDisplay = conversionData.conversionRate 
    ? `${conversionData.conversionRate.toFixed(1)}%`
    : '0%';

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Lead Analytics
      </Typography>

      {/* Conversion Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Total Leads
            </Typography>
            <Typography variant="h3">
              {conversionData.totalLeads || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Converted Leads
            </Typography>
            <Typography variant="h3" color="success.main">
              {conversionData.convertedLeads || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Lost Leads
            </Typography>
            <Typography variant="h3" color="error.main">
              {conversionData.lostLeads || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Conversion Rate
            </Typography>
            <Typography variant="h3" color="primary.main">
              {conversionRateDisplay}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Lead Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Lead Score Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Score Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={scoreData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Leads" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Lead Source Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Source Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Interaction Channel Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Interaction Channel Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={channelData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Number of Interactions" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Lead Acquisition Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Lead Acquisition Over Time
              </Typography>
              <FormControl sx={{ width: 120 }}>
                <InputLabel id="time-range-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-label"
                  id="time-range"
                  value={timeRange}
                  label="Time Range"
                  onChange={handleTimeRangeChange}
                  size="small"
                >
                  <MenuItem value={7}>7 Days</MenuItem>
                  <MenuItem value={30}>30 Days</MenuItem>
                  <MenuItem value={90}>90 Days</MenuItem>
                  <MenuItem value={365}>1 Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart
                data={timelineData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="New Leads" stroke="#2196F3" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}