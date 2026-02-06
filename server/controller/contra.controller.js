const Contra = require('../models/contra.models');
const { Ledger } = require('../models/ledger.models');
const { sendNotification } = require("./notification.controller.js");


// Create Contra voucher
const createContra = async (req, res) => {
  try {
    const { voucherNo, date, from, to, amount, description } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (from === to) {
      return res.status(400).json({ message: "From and To ledger cannot be same" });
    }

    const fromLedger = await Ledger.findById(from);
    const toLedger = await Ledger.findById(to);

    if (!fromLedger || !toLedger) {
      return res.status(404).json({ message: "Ledger not found" });
    }

    const contra = await Contra.create({
      voucherNo,
      date,
      from: { id: fromLedger._id, name: fromLedger.name },
      to: { id: toLedger._id, name: toLedger.name },
      amount: Number(amount),
      description,
      status: "Draft",
      createdBy: req.user._id,
    });

    res.status(201).json(contra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const applyContraToLedgers = async (contra, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;
  const amount = Number(contra.amount);

  const fromLedger = await Ledger.findById(contra.from.id);
  const toLedger = await Ledger.findById(contra.to.id);

  if (!fromLedger || !toLedger) {
    throw new Error("Ledger not found");
  }

  // From ledger → Credit
  fromLedger.currentBalance -= multiplier * amount;

  // To ledger → Debit
  toLedger.currentBalance += multiplier * amount;

  await fromLedger.save();
  await toLedger.save();
};

const postContra = async (req, res) => {
  try {
    const contra = await Contra.findById(req.params.id);
    if (!contra) {
      return res.status(404).json({ message: "Contra not found" });
    }

    if (contra.status !== "Draft") {
      return res.status(400).json({ message: "Only Draft contra can be posted" });
    }

    await applyContraToLedgers(contra, "add");

    contra.status = "Posted";
    await contra.save();

    res.json({ message: "Contra posted successfully", contra });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const cancelContra = async (req, res) => {
  try {
    const contra = await Contra.findById(req.params.id);
    if (!contra) {
      return res.status(404).json({ message: "Contra not found" });
    }

    if (contra.status !== "Posted") {
      return res.status(400).json({ message: "Only Posted contra can be cancelled" });
    }

    await applyContraToLedgers(contra, "subtract");

    contra.status = "Cancelled";
    await contra.save();

    res.json({ message: "Contra cancelled successfully", contra });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteContra = async (req, res) => {
  try {
    const contra = await Contra.findById(req.params.id);
    if (!contra) {
      return res.status(404).json({ message: "Contra not found" });
    }

    if (contra.status !== "Draft") {
      return res.status(400).json({
        message: "Only Draft contra can be deleted",
      });
    }

    await contra.deleteOne();
    res.json({ message: "Contra deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all Contra vouchers
const getAllContra = async (req, res) => {
  try {
    const contras = await Contra.find().sort({ date: -1 });
    res.json(contras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single Contra voucher by Id
const getContra = async (req, res) => {
  try {
    const contra = await Contra.findById(req.params.id);
    if (!contra) return res.status(404).json({ message: "Contra not found" });
    res.json(contra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single Contra voucher by voucherNo
const getContraByVoucherNo = async (req, res) => {
  try {
    const contra = await Contra.findOne({ voucherNo: req.params.voucherNo })
      .populate("from.id")
      .populate("to.id")
      .populate("createdBy");

    if (!contra) {
      return res.status(404).json({ message: "Contra voucher not found" });
    }

    res.json(contra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Contra voucher
const updateContra = async (req, res) => {
  try {
    const contra = await Contra.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(contra);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getNextContraNo = async (req, res) => {
  try {
    console.log("Fetching latest Contra...");
    const latest = await Contra.findOne().sort({ createdAt: -1 });
    console.log("Latest Contra:", latest);

    let nextNumber = 1;
    if (latest && latest.voucherNo) {
      const match = latest.voucherNo.match(/\d+$/);
      if (match) {
        const lastNumber = parseInt(match[0], 10);
        nextNumber = lastNumber + 1;
      }
    }

    const padded = String(nextNumber).padStart(4, '0');
    const nextVoucherNo = `CTRA-${padded}`;

    res.json({ voucherNo: nextVoucherNo });
  } catch (error) {
    console.error("Error in getNextContraNo:", error.message);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { createContra, getAllContra, getContraByVoucherNo, updateContra, deleteContra, getContra, getNextContraNo, postContra, cancelContra };