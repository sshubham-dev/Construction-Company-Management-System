const BusinessUnit = require("../models/businessunit.models");
const { Ledger } = require("../models/ledger.models");

const createBusinessUnit = async (req, res) => {
  try {
    const data = req.body;

    // Basic validation
    if (!data.name || !data.type) {
      return res.status(400).json({ error: "Name and Type are required" });
    }

    // Check duplicate code
    const exists = await BusinessUnit.findOne({ code: data.code });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Business Unit code already exists" });
    }

    if (!data.manager) {
      delete data.manager; // or payload.manager = null
    }

    // 1️⃣ Create Business Unit first (without ledger)
    const businessUnit = new BusinessUnit({
      ...data,
      manager: data.manager || null,
    });

    await businessUnit.save();

    // 2️⃣ Auto-create primary ledger for Business Unit
    const ledger = new Ledger({
      name: `${businessUnit.name} Capital`,
      under: "Capital Account",
      referenceType: "BusinessUnit",
      referenceId: businessUnit._id,
      openingBalance: 0,
    });

    const savedLedger = await ledger.save();

    // 3️⃣ Attach ledger to Business Unit
    businessUnit.ledgerId = savedLedger._id;
    await businessUnit.save();

    res.status(201).json(businessUnit);
  } catch (error) {
    console.error("Create BusinessUnit Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET all business units
const getBusinessUnits = async (req, res) => {
  try {
    const units = await BusinessUnit.find()
      .populate("manager", "userName")
      .populate("ledgerId", "name");

    res.json(units);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ONE
const getBusinessUnitById = async (req, res) => {
  try {
    // console.log(req)
    const unit = await BusinessUnit.findById(req.params.id)
      .populate("manager")
      .populate("ledgerId")
      .exec();

    if (!unit) {
      return res.status(404).json({ error: "Business Unit not found" });
    }

    res.json(unit);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateBusinessUnit = async (req, res) => {
  try {
    const unit = await BusinessUnit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ error: "Business Unit not found" });
    }

    // ❌ Do not allow ledger change
    if (req.body.ledgerId && req.body.ledgerId !== unit.ledgerId?.toString()) {
      return res.status(400).json({
        error: "Primary ledger cannot be changed",
      });
    }

    Object.assign(unit, req.body);
    await unit.save();

    res.json(unit);
  } catch (error) {
    console.error("Update BusinessUnit Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const deactivateBusinessUnit = async (req, res) => {
  const bu = await BusinessUnit.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  res.json(bu);
};

const deleteBusinessUnit = async (req, res) => {
  try {
    const unit = await BusinessUnit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ error: "Business Unit not found" });
    }

    // 🔒 Optional safety check (recommended)
    const hasLedger = await Ledger.findOne({ referenceId: unit._id });
    if (hasLedger) {
      return res.status(400).json({
        error: "Cannot delete Business Unit with ledger activity",
      });
    }

    await BusinessUnit.findByIdAndDelete(req.params.id);
    res.json({ message: "Business Unit deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBusinessUnit,
  getBusinessUnits,
  getBusinessUnitById,
  updateBusinessUnit,
  deleteBusinessUnit,
  deactivateBusinessUnit,
};
