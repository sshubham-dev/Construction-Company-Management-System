
const { Group, Ledger, CostCenter } = require("../models/ledger.models");

// CRUD for Ledger
const createLedger = async (req, res) => {
  try {
    const {
      name,
      under,
      isGSTApplicable,
      isTDSDeductible,
      mailingDetails,
      taxRegistrationDetails,
      bankingDetails,
      openingBalance,
    } = req.body;
    const ledger = new Ledger({
      name,
      under:{
        name:under,
      },
      isGSTApplicable,
      isTDSDeductible,
      mailingDetails,
      taxRegistrationDetails,
      bankingDetails,
      openingBalance,
      balance: openingBalance,
      paid:0,
      due:0,
      receivable:0,
      payable:0,
      received:0,
    });
    await ledger.save();
    res.status(201).json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addLedger = async (data, under, gst, tds, type) => {
  try {
    const ledger = new Ledger({
      name: data.name,
      alias: {
        id: data._id,
        type,
      },
      under,
      isGSTApplicable: gst,
      isTDSDeductible: tds,
      mailingDetails: {
        name: data.name,
        address: data.address.stree + ', ' + data.address.city + ', ' + data.address.district,
        state: data.address.state,
      },
      taxRegistrationDetails: {
        panNo: data.pan,
        gstin: data.gstNo,
      },
      bankingDetails: {
        name: data.name,
        acNo: '',
        ifscCode: '',
        bankname: '',
        branch: '',
      },
      openingBalance: 0,
    });
    await ledger.save();
  } catch (error) {
    console.log(error);
  }
};

const getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find();
    res.json(ledgers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLedgerById = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ message: "Ledger not found" });
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteLedger = async (req, res) => {
  try {
    await Ledger.findByIdAndDelete(req.params.id);
    res.json({ message: "Ledger deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CRUD for Group
const createGroup = async (req, res) => {
  try {
    console.log(req.body)
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLedger,
  createGroup,
  getLedgers,
  getGroups,
  getLedgerById,
  getGroupById,
  updateLedger,
  updateGroup,
  deleteGroup,
  deleteLedger,
  addLedger
}
