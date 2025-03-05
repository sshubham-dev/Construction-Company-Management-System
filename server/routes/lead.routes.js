const express = require('express');
const Lead = express.Router();
const { createLead, getAllLeads, getLeadById, updateLead, deleteLead, addFollowUp, changeLeadStatus } = require('../controller/lead.controller'); // Adjust the path as necessary
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create a new lead
Lead.post('/', createLead);

// Get all leads
Lead.get('/', getAllLeads);

// Get a lead by ID
Lead.get('/:id', getLeadById);

// Update a lead by ID
Lead.put('/:id', updateLead);

// Delete a lead by ID
Lead.delete('/:id', deleteLead);

// Change lead status
Lead.patch('/status', changeLeadStatus);

Lead.patch('/:id/followup', addFollowUp);

module.exports = Lead;