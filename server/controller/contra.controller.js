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

    const fromLedger = await Ledger.findById(from);
    const toLedger = await Ledger.findById(to);

    if (!fromLedger || !toLedger) {
      return res.status(404).json({ message: "One or both ledgers not found" });
    }

    const contra = new Contra({
      voucherNo,
      date,
      from: { id: from, name: fromLedger.name },
      to: { id: to, name: toLedger.name },
      amount:  Number(amount),
      description,
    });

    fromLedger.currentBalance = Number(fromLedger.currentBalance || 0) -  Number(amount);
    fromLedger.paid = Number(fromLedger.paid || 0) +  Number(amount)
    toLedger.currentBalance = Number(toLedger.currentBalance || 0) +  Number(amount);
    toLedger.received = Number(toLedger.received || 0) +  Number(amount);

    fromLedger.transaction.push({ id: contra._id, type: "Contra", amount: - Number(amount) });
    toLedger.transaction.push({ id: contra._id, type: "Contra", amount:  Number(amount) });

    await contra.save();
    await fromLedger.save();
    await toLedger.save();

    res.status(201).json(contra);
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
      .populate('fromAccount.id')
      .populate('toAccount.id')
      .populate('createdBy');

    if (!contra) {
      return res.status(404).json({ message: 'Contra voucher not found' });
    }

    res.status(200).json({ message: 'Contra voucher retrieved successfully', data: contra });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error fetching contra voucher', error: error.message });
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

// Delete Contra voucher
const deleteContra = async (req, res) => {
  try {
    const contra = await Contra.findById(req.params.id);
    if (!contra) return res.status(404).json({ message: "Contra not found" });

    await Ledger.findByIdAndUpdate(contra.from.id, {
      $pull: { transaction: { id: contra._id } },
      $inc: { balance: contra.amount },
    });

    await Ledger.findByIdAndUpdate(contra.to.id, {
      $pull: { transaction: { id: contra._id } },
      $inc: { balance: -contra.amount },
    });

    await contra.deleteOne();
    res.json({ message: "Contra deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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


module.exports = { createContra, getAllContra, getContraByVoucherNo, updateContra, deleteContra, getContra, getNextContraNo };