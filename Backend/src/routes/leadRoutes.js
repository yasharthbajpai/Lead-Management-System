const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { scoreNewLead } = require('../services/leadScoringService');
const { auth } = require('../middleware/auth');
const { addActivityScore } = require('../services/scoreService');

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ leadScore: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single lead
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new lead
router.post('/', auth, async (req, res) => {
  const lead = new Lead({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    source: req.body.source,
    initialMessage: req.body.initialMessage,
    status: 'new',
    createdBy: req.user._id
  });

  try {
    const newLead = await lead.save();
    
    // Trigger lead scoring
    await scoreNewLead(newLead._id);
    
    // Add user activity score for creating a lead
    await addActivityScore(
      req.user._id, 
      'create_lead', 
      `Created lead for ${newLead.name}`
    );
    
    res.status(201).json(newLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update lead
router.patch('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const previousStatus = lead.status;
    
    Object.keys(req.body).forEach(key => {
      lead[key] = req.body[key];
    });

    const updatedLead = await lead.save();
    
    // Add user activity score for updating a lead
    await addActivityScore(
      req.user._id, 
      'update_lead', 
      `Updated lead ${lead.name}${previousStatus !== lead.status ? ` (Status: ${previousStatus} → ${lead.status})` : ''}`
    );
    
    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    await Lead.deleteOne({ _id: req.params.id });
    
    // Add user activity score for deleting a lead
    await addActivityScore(
      req.user._id, 
      'other', 
      `Deleted lead ${lead.name}`
    );
    
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 