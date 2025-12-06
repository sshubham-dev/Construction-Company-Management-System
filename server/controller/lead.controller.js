const Lead = require("../models/lead.models"); // Adjust the path as necessary
const User = require("../models/user.models");
const { sendNotification } = require("./notification.controller");
// Create a new lead
const createLead = async (req, res) => {
  try {
    const {
      name,
      contact,
      location,
      leadStatus,
      requirement,
      source,
      contactAgent,
      isClient,
    } = req.body;
    console.log(req.body);
    const lead = new Lead({
      name,
      contact,
      location,
      leadStatus,
      requirement,
      source,
      contactAgent,
      isClient,
    });
    await lead.save();
    const employees = await User.find({ role: "Employee" });

    for (const employee of employees) {
      employee.notification.push({
        title: "Lead Alert",
        message: `We got a new Lead from ${
          lead?.contactAgent ? lead?.contactAgent : lead?.source
        }`,
        createdAt: lead.createdAt ? lead.createdAt : new Date(),
        link: `/crm/lead`,
      });
      await employee.save();
      sendNotification(employee._id, {
        title: "Lead Alert",
        message: `We got a new Lead from ${
          lead?.contactAgent ? lead?.contactAgent : lead?.source
        }`,
      });
    }
    res.status(201).json({
      message: `We got a new Lead from ${
        lead?.contactAgent ? lead?.contactAgent : lead?.source
      }`,
      lead,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Error creating lead", error: error.message });
  }
};

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leads", error: error.message });
  }
};

// Get a lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(lead);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching lead", error: error.message });
  }
};

// Update a lead by ID
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json({ message: "Lead updated successfully", lead });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating lead", error: error.message });
  }
};

// Delete a lead by ID
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting lead", error: error.message });
  }
};

// Business logic example: Change lead status
const changeLeadStatus = async (req, res) => {
  try {
    const { id, newStatus } = req.body;
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    lead.status = newStatus;
    await lead.save();
    res.status(200).json({ message: "Lead status updated successfully", lead });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating lead status", error: error.message });
  }
};

// Add follow-up
const addFollowUp = async (req, res) => {
  try {
    const { date, message } = req.body; // Expecting { followUpNo: '1', date: '2023-10-01', message: 'Follow up message' }
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).send("Lead not found");
    }
    const followUpNo = lead.followUps.length + 1;
    lead.followUps.push({ followUpNo, date, message });
    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addFollowUp,
  changeLeadStatus,
};
