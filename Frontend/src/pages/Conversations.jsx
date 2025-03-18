import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Alert,
  Chip,
  IconButton,
  InputAdornment,
  Tab,
  Tabs
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiService from '../services/api';
import WhatsAppChatBubble from '../components/WhatsAppChatBubble';

export default function Conversations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [searchTerm, conversations, activeTab]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.leadId, selectedConversation.channel);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getActiveConversations();
      setConversations(response.data);
      setFilteredConversations(filterConversations(response.data, searchTerm, activeTab));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (leadId, channel) => {
    setMessageLoading(true);
    try {
      const response = await apiService.getMessagesByConversation(leadId, channel);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setMessageLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = conversations;
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.leadName.toLowerCase().includes(search) || 
        conv.lastMessagePreview.toLowerCase().includes(search)
      );
    }
    
    // Apply tab filter
    if (activeTab === 1) { // WhatsApp
      filtered = filtered.filter(conv => conv.channel === 'whatsapp');
    } else if (activeTab === 2) { // Email
      filtered = filtered.filter(conv => conv.channel === 'email');
    }
    
    setFilteredConversations(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      // Log interaction
      await apiService.createInteraction({
        leadId: selectedConversation.leadId,
        channel: selectedConversation.channel,
        direction: 'outbound',
        content: newMessage
      });
      
      // Send message through the appropriate channel
      if (selectedConversation.channel === 'whatsapp') {
        await apiService.sendWhatsAppMessage(selectedConversation.leadId, newMessage);
      } else if (selectedConversation.channel === 'email') {
        const subject = `Follow-up from ${selectedConversation.leadName}`;
        await apiService.sendEmailMessage(selectedConversation.leadId, subject, newMessage);
      }
      
      setNewMessage('');
      
      // Refresh messages
      fetchMessages(selectedConversation.leadId, selectedConversation.channel);
      
      // Refresh conversation list
      fetchConversations();
    } catch (err) {
      console.error('Error sending message:', err);
      alert(`Failed to send message: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return <WhatsAppIcon fontSize="small" color="success" />;
      case 'email':
        return <EmailIcon fontSize="small" color="primary" />;
      default:
        return <PersonIcon fontSize="small" />;
    }
  };

  const handleViewLead = (leadId) => {
    navigate(`/leads/${leadId}`);
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

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Conversations
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="All" />
          <Tab label="WhatsApp" icon={<WhatsAppIcon />} iconPosition="start" />
          <Tab label="Email" icon={<EmailIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <Grid container spacing={3}>
        {/* Conversation List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ mb: 2, p: 1 }}>
            <TextField
              fullWidth
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small">
                      <FilterIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              variant="outlined"
              size="small"
            />
          </Paper>
          
          <Paper sx={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}>
            {filteredConversations.length > 0 ? (
              <List disablePadding>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={`${conversation.leadId}-${conversation.channel}`}
                    divider
                    button
                    selected={selectedConversation && selectedConversation.leadId === conversation.leadId && selectedConversation.channel === conversation.channel}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getChannelIcon(conversation.channel)}
                            <Typography sx={{ ml: 1 }} variant="subtitle1">
                              {conversation.leadName}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(conversation.lastMessageTime), 'MMM d, h:mm a')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" noWrap sx={{ opacity: 0.7 }}>
                            {conversation.lastMessagePreview}
                          </Typography>
                          <Box sx={{ mt: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                            <Chip 
                              size="small" 
                              label={conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)} 
                              color={
                                conversation.status === 'new' ? 'info' :
                                conversation.status === 'qualified' ? 'primary' :
                                conversation.status === 'contacted' ? 'warning' :
                                conversation.status === 'converted' ? 'success' :
                                'error'
                              }
                            />
                            {conversation.unreadCount > 0 && (
                              <Chip
                                size="small"
                                label={conversation.unreadCount}
                                color="error"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No conversations found
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Conversation Detail */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            {/* Messages Area */}
            {selectedConversation ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getChannelIcon(selectedConversation.channel)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {selectedConversation.leadName}
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewLead(selectedConversation.leadId)}
                    >
                      View Lead Profile
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  flexGrow: 1, 
                  p: 2, 
                  overflow: 'auto', 
                  backgroundColor: selectedConversation.channel === 'whatsapp' ? '#e5ddd5' : '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {messageLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">No messages yet</Typography>
                    </Box>
                  ) : (
                    messages.map((message) => (
                      selectedConversation.channel === 'whatsapp' ? (
                        <WhatsAppChatBubble
                          key={message._id}
                          message={message.content}
                          isOutbound={message.direction === 'outbound'}
                          timestamp={message.timestamp}
                          isRead={message.read}
                        />
                      ) : (
                        <Box 
                          key={message._id}
                          sx={{ 
                            alignSelf: message.direction === 'outbound' ? 'flex-end' : 'flex-start',
                            mb: 2,
                            maxWidth: '70%'
                          }}
                        >
                          <Paper sx={{ 
                            p: 2, 
                            backgroundColor: message.direction === 'outbound' ? '#e3f2fd' : 'white'
                          }}>
                            <Typography variant="body1">
                              {message.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                              {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                            </Typography>
                          </Paper>
                        </Box>
                      )
                    ))
                  )}
                </Box>
                
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                  <Grid container spacing={1}>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        variant="outlined"
                        size="small"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <Button 
                        variant="contained" 
                        color={selectedConversation.channel === 'whatsapp' ? 'success' : 'primary'}
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        Send
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#f5f5f5' }}>
                <Typography color="text.secondary">Select a conversation</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 