const BusinessUnit = require("../models/businessunit.models.js");

// CREATE a business unit
const createBusinessUnit = async (req, res) => {
  try {
    const {
      name,
      type,
      address,
      phone,
      email,
      gstNo,
      panNo,
    } = req.body;

    const existing = await BusinessUnit.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Business Unit already exists" });
    }

    const bu = new BusinessUnit({
      name,
      type,
      address,
      phone,
      email,
      gstNo,
      panNo,
    });

    await bu.save();

    res.status(201).json({
      message: "Business Unit created successfully",
      businessUnit: bu,
    });
  } catch (err) {
    console.error("Error creating BU:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all business units
const getBusinessUnits = async (req, res) => {
  try {
    const list = await BusinessUnit.find().sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (err) {
    console.error("Error fetching BU:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ONE
const getBU = async (req, res) => {
  try {
    const bu = await BusinessUnit.findById(req.params.id).populate("manager");
    res.json(bu);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

// UPDATE
const updateBU = async (req, res) => {
  try {
    const bu = await BusinessUnit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: "Updated", data: bu });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE
const deleteBU = async (req, res) => {
  try {
    await BusinessUnit.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

module.exports = {
  createBusinessUnit,
  getBusinessUnits,
  getBU,
  updateBU,
  deleteBU,
};
