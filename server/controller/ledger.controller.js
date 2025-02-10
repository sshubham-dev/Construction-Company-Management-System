const Ledger = require("../models/Ledger");
const Group = require("../models/Group");
const CostCenter = require("../models/CostCenter");

// CRUD for Ledger
exports.createLedger = async (req, res) => {
  try {
    const ledger = new Ledger(req.body);
    await ledger.save();
    res.status(201).json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find();
    res.json(ledgers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLedgerById = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ message: "Ledger not found" });
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLedger = async (req, res) => {
  try {
    await Ledger.findByIdAndDelete(req.params.id);
    res.json({ message: "Ledger deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CRUD for Group
exports.createGroup = async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

