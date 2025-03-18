import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Alert,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Key as KeyIcon,
  Notifications as NotificationsIcon,
  SettingsApplications as SettingsApplicationsIcon
} from '@mui/icons-material';
import apiService from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // API & Integration Settings
  const [perplexityApiKey, setPerplexityApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [showOpenaiApiKey, setShowOpenaiApiKey] = useState(false);
  const [emailApiKey, setEmailApiKey] = useState('');
  const [showEmailApiKey, setShowEmailApiKey] = useState(false);
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [showWhatsappApiKey, setShowWhatsappApiKey] = useState(false);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [newLeadNotification, setNewLeadNotification] = useState(true);
  const [convertedLeadNotification, setConvertedLeadNotification] = useState(true);
  const [lostLeadNotification, setLostLeadNotification] = useState(false);
  
  // Lead Scoring Settings
  const [useAiScoring, setUseAiScoring] = useState(true);
  const [minimumLeadScore, setMinimumLeadScore] = useState(30);
  const [scoringFrequency, setScoringFrequency] = useState('realtime');
  const [autoQualifyThreshold, setAutoQualifyThreshold] = useState(70);
  
  // Engagement Settings
  const [responseTimeTarget, setResponseTimeTarget] = useState(2);
  const [followUpDays, setFollowUpDays] = useState(3);
  const [maxFollowUps, setMaxFollowUps] = useState(3);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSettings();
      const settings = response.data;
      
      // Set API Keys
      setPerplexityApiKey(settings.api?.perplexity || '');
      setOpenaiApiKey(settings.api?.openai || '');
      setEmailApiKey(settings.api?.email || '');
      setWhatsappApiKey(settings.api?.whatsapp || '');
      
      // Set Notification Settings
      setEmailNotifications(settings.notifications?.email?.enabled || true);
      setAdminEmail(settings.notifications?.email?.adminEmail || '');
      setDesktopNotifications(settings.notifications?.desktop?.enabled || true);
      setNewLeadNotification(settings.notifications?.triggers?.newLead || true);
      setConvertedLeadNotification(settings.notifications?.triggers?.leadConverted || true);
      setLostLeadNotification(settings.notifications?.triggers?.leadLost || false);
      
      // Set Lead Scoring Settings
      setUseAiScoring(settings.leadScoring?.useAi || true);
      setMinimumLeadScore(settings.leadScoring?.minimumScore || 30);
      setScoringFrequency(settings.leadScoring?.frequency || 'realtime');
      setAutoQualifyThreshold(settings.leadScoring?.autoQualifyThreshold || 70);
      
      // Set Engagement Settings
      setResponseTimeTarget(settings.engagement?.responseTimeHours || 2);
      setFollowUpDays(settings.engagement?.followUpDays || 3);
      setMaxFollowUps(settings.engagement?.maxFollowUps || 3);
      setEmailTemplate(settings.engagement?.templates?.email || '');
      setWhatsappTemplate(settings.engagement?.templates?.whatsapp || '');
      
    } catch (err) {
      console.error('Error fetching settings:', err);
      setErrorMessage('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const settingsData = {
        api: {
          perplexity: perplexityApiKey,
          openai: openaiApiKey,
          email: emailApiKey,
          whatsapp: whatsappApiKey
        },
        notifications: {
          email: {
            enabled: emailNotifications,
            adminEmail: adminEmail
          },
          desktop: {
            enabled: desktopNotifications
          },
          triggers: {
            newLead: newLeadNotification,
            leadConverted: convertedLeadNotification,
            leadLost: lostLeadNotification
          }
        },
        leadScoring: {
          useAi: useAiScoring,
          minimumScore: minimumLeadScore,
          frequency: scoringFrequency,
          autoQualifyThreshold: autoQualifyThreshold
        },
        engagement: {
          responseTimeHours: responseTimeTarget,
          followUpDays: followUpDays,
          maxFollowUps: maxFollowUps,
          templates: {
            email: emailTemplate,
            whatsapp: whatsappTemplate
          }
        }
      };
      
      await apiService.updateSettings(settingsData);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMessage('Failed to save settings. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Settings
      </Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab icon={<KeyIcon />} iconPosition="start" label="API Keys" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
            <Tab icon={<SettingsApplicationsIcon />} iconPosition="start" label="System Settings" />
          </Tabs>
        </Box>
        
        {/* API Keys Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            API Keys & Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure the API keys required for various services used by the application.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Perplexity API Key"
                value={perplexityApiKey}
                onChange={(e) => setPerplexityApiKey(e.target.value)}
                type={showApiKey ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle api key visibility"
                        onClick={() => setShowApiKey(!showApiKey)}
                        edge="end"
                      >
                        {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText="API key for Perplexity.ai for AI-driven lead analysis"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="OpenAI API Key (Optional)"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                type={showOpenaiApiKey ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle OpenAI api key visibility"
                        onClick={() => setShowOpenaiApiKey(!showOpenaiApiKey)}
                        edge="end"
                      >
                        {showOpenaiApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText="Alternative API key for AI services (optional)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Service API Key"
                value={emailApiKey}
                onChange={(e) => setEmailApiKey(e.target.value)}
                type={showEmailApiKey ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle email api key visibility"
                        onClick={() => setShowEmailApiKey(!showEmailApiKey)}
                        edge="end"
                      >
                        {showEmailApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText="API key for sending emails (e.g. SendGrid, Mailgun)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="WhatsApp API Key"
                value={whatsappApiKey}
                onChange={(e) => setWhatsappApiKey(e.target.value)}
                type={showWhatsappApiKey ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle whatsapp api key visibility"
                        onClick={() => setShowWhatsappApiKey(!showWhatsappApiKey)}
                        edge="end"
                      >
                        {showWhatsappApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText="API key for WhatsApp Business API"
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure when and how you'd like to receive notifications about leads.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Email Notifications
                </Typography>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                      />
                    } 
                    label="Enable Email Notifications" 
                  />
                </FormGroup>
                
                <TextField
                  fullWidth
                  label="Admin Email Address"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={!emailNotifications}
                  variant="outlined"
                  margin="normal"
                  type="email"
                  helperText="Email address to receive notifications"
                />
              </Paper>
              
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Desktop Notifications
                </Typography>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={desktopNotifications}
                        onChange={(e) => setDesktopNotifications(e.target.checked)}
                      />
                    } 
                    label="Enable Desktop Notifications" 
                  />
                </FormGroup>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Notification Triggers
                </Typography>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={newLeadNotification}
                        onChange={(e) => setNewLeadNotification(e.target.checked)}
                      />
                    } 
                    label="New Lead Received" 
                  />
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={convertedLeadNotification}
                        onChange={(e) => setConvertedLeadNotification(e.target.checked)}
                      />
                    } 
                    label="Lead Converted" 
                  />
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={lostLeadNotification}
                        onChange={(e) => setLostLeadNotification(e.target.checked)}
                      />
                    } 
                    label="Lead Lost" 
                  />
                </FormGroup>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* System Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Lead Scoring Settings
              </Typography>
              <Paper sx={{ p: 2, mb: 3 }}>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={useAiScoring}
                        onChange={(e) => setUseAiScoring(e.target.checked)}
                      />
                    } 
                    label="Use AI-based Lead Scoring" 
                  />
                </FormGroup>
                
                <TextField
                  fullWidth
                  label="Minimum Lead Score"
                  value={minimumLeadScore}
                  onChange={(e) => setMinimumLeadScore(Number(e.target.value))}
                  type="number"
                  variant="outlined"
                  margin="normal"
                  inputProps={{ min: 0, max: 100 }}
                  disabled={!useAiScoring}
                  helperText="Minimum score for a lead to be considered valuable (0-100)"
                />
                
                <TextField
                  fullWidth
                  label="Auto-Qualify Threshold"
                  value={autoQualifyThreshold}
                  onChange={(e) => setAutoQualifyThreshold(Number(e.target.value))}
                  type="number"
                  variant="outlined"
                  margin="normal"
                  inputProps={{ min: 0, max: 100 }}
                  disabled={!useAiScoring}
                  helperText="Score threshold to automatically mark leads as 'qualified' (0-100)"
                />
                
                <FormControl fullWidth margin="normal" disabled={!useAiScoring}>
                  <InputLabel id="scoring-frequency-label">Scoring Frequency</InputLabel>
                  <Select
                    labelId="scoring-frequency-label"
                    value={scoringFrequency}
                    label="Scoring Frequency"
                    onChange={(e) => setScoringFrequency(e.target.value)}
                  >
                    <MenuItem value="realtime">Real-time (with each interaction)</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="manual">Manual only</MenuItem>
                  </Select>
                  <FormHelperText>How often leads should be scored automatically</FormHelperText>
                </FormControl>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Engagement Settings
              </Typography>
              <Paper sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Response Time Target (hours)"
                  value={responseTimeTarget}
                  onChange={(e) => setResponseTimeTarget(Number(e.target.value))}
                  type="number"
                  variant="outlined"
                  margin="normal"
                  inputProps={{ min: 1, step: 0.5 }}
                  helperText="Target time to respond to new leads (in hours)"
                />
                
                <TextField
                  fullWidth
                  label="Follow-up Days"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(Number(e.target.value))}
                  type="number"
                  variant="outlined"
                  margin="normal"
                  inputProps={{ min: 1 }}
                  helperText="Days to wait before sending follow-up message"
                />
                
                <TextField
                  fullWidth
                  label="Maximum Follow-ups"
                  value={maxFollowUps}
                  onChange={(e) => setMaxFollowUps(Number(e.target.value))}
                  type="number"
                  variant="outlined"
                  margin="normal"
                  inputProps={{ min: 0 }}
                  helperText="Maximum number of follow-up messages to send (0 for unlimited)"
                />
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Message Templates
                </Typography>
                
                <TextField
                  fullWidth
                  label="Email Template"
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  margin="normal"
                  helperText="Default template for email messages. Use {name} to insert lead's name."
                />
                
                <TextField
                  fullWidth
                  label="WhatsApp Template"
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  margin="normal"
                  helperText="Default template for WhatsApp messages. Use {name} to insert lead's name."
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
      
      {/* Success Message */}
      <Snackbar 
        open={Boolean(successMessage)} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Error Message */}
      <Snackbar 
        open={Boolean(errorMessage)} 
        autoHideDuration={6000} 
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 