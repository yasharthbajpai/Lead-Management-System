import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../services/api';
import LeadForm from '../components/LeadForm';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lead-tabpanel-${index}`}
      aria-labelledby={`lead-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageChannel, setMessageChannel] = useState('');

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      
      // Fetch lead details
      const leadResponse = await apiService.getLeadById(id);
      setLead(leadResponse.data);
      
      // Fetch interactions
      const interactionsResponse = await apiService.getInteractionsByLeadId(id);
      setInteractions(interactionsResponse.data);
      
      // Fetch insights
      const insightsResponse = await apiService.getInsightsByLeadId(id);
      setInsights(insightsResponse.data);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching lead data:', err);
      setError('Failed to load lead data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      // Log interaction
      await apiService.createInteraction({
        leadId: id,
        channel: messageChannel,
        direction: 'outbound',
        content: newMessage
      });
      
      // Send message through the appropriate channel
      if (messageChannel === 'whatsapp') {
        await apiService.sendWhatsAppMessage(id, newMessage);
        setSuccessMessage('WhatsApp message sent successfully');
      } else if (messageChannel === 'email') {
        const subject = `Follow-up from ${lead.assignedTo || 'our team'}`;
        await apiService.sendEmailMessage(id, subject, newMessage);
        setSuccessMessage('Email sent successfully');
      }
      
      setNewMessage('');
      setMessageDialogOpen(false);
      
      // Refresh interactions
      const interactionsResponse = await apiService.getInteractionsByLeadId(id);
      setInteractions(interactionsResponse.data);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(`Failed to send ${messageChannel} message. ${err.response?.data?.message || 'Please try again.'}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateLead = async (leadData) => {
    try {
      await apiService.updateLead(id, leadData);
      setEditDialogOpen(false);
      setSuccessMessage('Lead updated successfully');
      fetchLeadData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating lead:', err);
      setError('Failed to update lead. Please try again.');
    }
  };

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

  const getScoreColor = (score) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
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

  if (!lead) {
    return (
      <Alert severity="info">
        Lead not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/leads')}
        >
          Back to Leads
        </Button>
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => {
              setMessageChannel('email');
              setMessageDialogOpen(true);
            }}
            sx={{ mr: 1 }}
          >
            <EmailIcon />
          </IconButton>
          <IconButton 
            color="success" 
            onClick={() => {
              setMessageChannel('whatsapp');
              setMessageDialogOpen(true);
            }}
            sx={{ mr: 1 }}
          >
            <WhatsAppIcon />
          </IconButton>
          <IconButton color="primary" onClick={() => setEditDialogOpen(true)}>
            <EditIcon />
          </IconButton>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {lead.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                <strong>Email:</strong> {lead.email}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                <strong>Phone:</strong> {lead.phone}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                <strong>Source:</strong> {lead.source.replace('_', ' ').charAt(0).toUpperCase() + lead.source.replace('_', ' ').slice(1)}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                <strong>Created:</strong> {format(new Date(lead.createdAt), 'PPP')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Lead Score
                </Typography>
                <Chip
                  label={lead.leadScore || 0}
                  color={getScoreColor(lead.leadScore || 0)}
                  size="large"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  color={getStatusColor(lead.status)}
                  size="large"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Interactions" />
          <Tab label="AI Insights" />
          <Tab label="Lead Information" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {interactions.length > 0 ? (
            <List>
              {interactions.map((interaction) => (
                <ListItem key={interaction._id} alignItems="flex-start" divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {interaction.channel.charAt(0).toUpperCase() + interaction.channel.slice(1)} - 
                          {interaction.direction === 'inbound' ? ' Received' : ' Sent'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(interaction.timestamp), 'PPp')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body1" component="span">
                          {interaction.content}
                        </Typography>
                        {interaction.sentiment !== undefined && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                              Sentiment:
                            </Typography>
                            <Chip
                              size="small"
                              label={
                                interaction.sentiment > 0
                                  ? 'Positive'
                                  : interaction.sentiment < 0
                                  ? 'Negative'
                                  : 'Neutral'
                              }
                              color={
                                interaction.sentiment > 0
                                  ? 'success'
                                  : interaction.sentiment < 0
                                  ? 'error'
                                  : 'default'
                              }
                            />
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 3 }}>
              No interactions found for this lead.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {insights.length > 0 ? (
            <Box>
              {insights.map((insight) => (
                <Paper key={insight._id} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Insights from {format(new Date(insight.timestamp), 'PPp')}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Key Insights:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {Object.entries(insight.insights).map(([key, value]) => (
                      <Typography key={key} variant="body1" sx={{ mb: 1 }}>
                        <strong>{key.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').trim().slice(1)}:</strong> {
                          typeof value === 'object' ? JSON.stringify(value) : value.toString()
                        }
                      </Typography>
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Recommended Actions:
                  </Typography>
                  <List>
                    {insight.recommendedActions.map((action, index) => (
                      <ListItem key={index} divider={index < insight.recommendedActions.length - 1}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1">{action.action}</Typography>
                              <Chip
                                size="small"
                                label={action.priority}
                                color={
                                  action.priority === 'high' 
                                    ? 'error' 
                                    : action.priority === 'medium' 
                                    ? 'warning' 
                                    : 'info'
                                }
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                          secondary={action.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 3 }}>
              No AI insights available for this lead.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Lead Information
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    <strong>Name:</strong> {lead.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Email:</strong> {lead.email}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Phone:</strong> {lead.phone}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Source:</strong> {lead.source.replace('_', ' ').charAt(0).toUpperCase() + lead.source.replace('_', ' ').slice(1)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Status:</strong> {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Lead Score:</strong> {lead.leadScore || 0}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Created:</strong> {format(new Date(lead.createdAt), 'PPP')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Last Updated:</strong> {format(new Date(lead.updatedAt), 'PPP')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Initial Message
              </Typography>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  {lead.initialMessage ? (
                    <Typography variant="body1">{lead.initialMessage}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No initial message recorded.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Edit Lead Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth>
        <DialogTitle>Edit Lead</DialogTitle>
        <DialogContent>
          <LeadForm lead={lead} onSubmit={handleUpdateLead} />
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog 
        open={messageDialogOpen} 
        onClose={() => setMessageDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {messageChannel === 'whatsapp' ? 'Send WhatsApp Message' : 'Send Email'}
          <IconButton
            aria-label="close"
            onClick={() => setMessageDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {messageChannel === 'whatsapp' ? (
            <>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <WhatsAppIcon color="success" sx={{ mr: 1 }} />
                <Typography>
                  Sending to: {lead.phone || 'No phone number'}
                </Typography>
              </Box>
              {!lead.phone && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This lead doesn't have a phone number. Please add one before sending a WhatsApp message.
                </Alert>
              )}
            </>
          ) : (
            <>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography>
                  Sending to: {lead.email || 'No email address'}
                </Typography>
              </Box>
              {!lead.email && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This lead doesn't have an email address. Please add one before sending an email.
                </Alert>
              )}
            </>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Message"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={messageChannel === 'whatsapp' 
              ? "Type your WhatsApp message here..."
              : "Type your email message here..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSendMessage} 
            variant="contained" 
            color={messageChannel === 'whatsapp' ? 'success' : 'primary'}
            disabled={(messageChannel === 'whatsapp' && !lead.phone) || 
                      (messageChannel === 'email' && !lead.email) ||
                      !newMessage.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 