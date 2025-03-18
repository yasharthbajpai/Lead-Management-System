const express = require('express');
const router = express.Router();
const Interaction = require('../models/Interaction');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');
const { addActivityScore } = require('../services/scoreService');

// Get all interactions for a lead
router.get('/lead/:leadId', auth, async (req, res) => {
  try {
    let query = { leadId: req.params.leadId };
    
    // Add channel filter if provided
    if (req.query.channel) {
      query.channel = req.query.channel;
    }
    
    // Only get message type interactions (not notes or insights)
    query.$or = [{ type: 'message' }, { type: { $exists: false } }];
    
    const interactions = await Interaction.find(query)
      .sort({ timestamp: -1 });
    res.json(interactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new interaction
router.post('/', auth, async (req, res) => {
  const interaction = new Interaction({
    leadId: req.body.leadId,
    channel: req.body.channel,
    direction: req.body.direction,
    content: req.body.content,
    sentiment: req.body.sentiment,
    intentScore: req.body.intentScore,
    createdBy: req.user._id
  });

  try {
    const newInteraction = await interaction.save();
    
    // Update lead status based on interaction
    const lead = await Lead.findById(req.body.leadId);
    if (lead) {
      if (req.body.direction === 'inbound') {
        lead.status = 'contacted';
      }
      await lead.save();
    }
    
    // Add user activity score for creating an interaction
    await addActivityScore(
      req.user._id,
      'interaction',
      `Created ${req.body.direction} interaction via ${req.body.channel} for lead ${lead ? lead.name : req.body.leadId}`
    );
    
    res.status(201).json(newInteraction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update interaction
router.patch('/:id', auth, async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }

    Object.keys(req.body).forEach(key => {
      interaction[key] = req.body[key];
    });

    const updatedInteraction = await interaction.save();
    
    // Add user activity score for updating an interaction
    await addActivityScore(
      req.user._id,
      'other',
      `Updated interaction for lead ID ${interaction.leadId}`
    );
    
    res.json(updatedInteraction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete interaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }
    
    await Interaction.deleteOne({ _id: req.params.id });
    
    // Add user activity score for deleting an interaction
    await addActivityScore(
      req.user._id,
      'other',
      `Deleted interaction for lead ID ${interaction.leadId}`
    );
    
    res.json({ message: 'Interaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Added Engagement Functionality =====

// Track email open
router.post('/track/email-open/:leadId', async (req, res) => {
  try {
    const interaction = new Interaction({
      leadId: req.params.leadId,
      channel: 'email',
      direction: 'inbound',
      content: 'Email opened',
      type: 'engagement'
    });
    
    await interaction.save();
    
    // Update lead status
    const lead = await Lead.findById(req.params.leadId);
    if (lead) {
      lead.lastEngagement = new Date();
      await lead.save();
    }
    
    res.status(200).send('OK');
  } catch (err) {
    console.error('Email tracking error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Track link click
router.post('/track/link-click/:leadId', async (req, res) => {
  try {
    const { url } = req.body;
    
    const interaction = new Interaction({
      leadId: req.params.leadId,
      channel: 'web',
      direction: 'inbound',
      content: `Clicked link: ${url}`,
      type: 'engagement'
    });
    
    await interaction.save();
    
    // Update lead status and score
    const lead = await Lead.findById(req.params.leadId);
    if (lead) {
      lead.lastEngagement = new Date();
      lead.score += 10; // Increase lead score for link clicks
      await lead.save();
    }
    
    res.status(200).send('OK');
  } catch (err) {
    console.error('Link tracking error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get active conversations grouped by lead and channel
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get the latest interaction for each lead and channel combination
    const latestInteractions = await Interaction.aggregate([
      // Only include message type interactions (not notes, insights, etc.)
      { $match: { $or: [{ type: 'message' }, { type: { $exists: false } }] } },
      // Group by lead and channel
      { $group: {
          _id: { leadId: '$leadId', channel: '$channel' },
          latestInteraction: { $max: '$timestamp' },
          interactionId: { $last: '$_id' },
          content: { $last: '$content' },
          direction: { $last: '$direction' }
        }
      },
      // Sort by latest interaction timestamp
      { $sort: { latestInteraction: -1 } },
      // Limit to recent conversations (last 30 days)
      { $match: { latestInteraction: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }
    ]);

    // Get lead details for each conversation
    const conversations = await Promise.all(
      latestInteractions.map(async (interaction) => {
        const lead = await Lead.findById(interaction._id.leadId, 'name email phone');
        if (!lead) {
          return null;
        }
        
        return {
          id: `${interaction._id.leadId}-${interaction._id.channel}`,
          leadId: interaction._id.leadId,
          channel: interaction._id.channel,
          leadName: lead.name,
          leadEmail: lead.email,
          leadPhone: lead.phone,
          lastMessage: interaction.content,
          lastDirection: interaction.direction,
          lastTimestamp: interaction.latestInteraction
        };
      })
    );

    // Filter out null values (leads that were not found)
    const validConversations = conversations.filter(conv => conv !== null);
    
    res.json(validConversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 