const express = require('express');
const Lead = express.Router();
const { createLead, getAllLeads, getLeadById, updateLead, deleteLead, addFollowUp, changeLeadStatus } = require('../controller/lead.controller'); // Adjust the path as necessary
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create a new lead
Lead.post('/', createLead);

// Get all leads
Lead.get('/', userAuth, getAllLeads);

// Get a lead by ID
Lead.get('/:id', userAuth, getLeadById);

// Update a lead by ID
Lead.put('/followup', userAuth, addFollowUp);
Lead.put('/status', userAuth, changeLeadStatus);
Lead.put('/:id', userAuth, updateLead);

// Delete a lead by ID
Lead.delete('/:id', userAuth, deleteLead);

// Change lead status


module.exports = Lead;