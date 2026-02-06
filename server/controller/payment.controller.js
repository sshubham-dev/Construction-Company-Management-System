const Payment = require('../models/payment.models');
const { Ledger } = require("../models/ledger.models");
const { sendNotification } = require("./notification.controller.js");

const generatePaymentNo = async (req, res) => {
  try {
    const latest = await Payment.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (latest?.paymentNo) {
      const match = latest.paymentNo.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    const padded = String(nextNumber).padStart(4, '0');
    const paymentNo = `PMT-${padded}`;

    res.json({ paymentNo });
  } catch (error) {
    console.error("Error generating payment number:", error);
    res.status(500).json({ error: error.message });
  }
};

const applyPaymentToLedgers = async (payment, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;
  const amount = Number(payment.amount);

  const fromLedger = await Ledger.findById(payment.from.id);
  const toLedger = await Ledger.findById(payment.to.id);

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

// Create a payment
const createPayment = async (req, res) => {
  try {
    const {
      paymentNo,
      date,
      from,
      to,
      referenceNo,
      amount,
      description,
      paymentFor,
      invoice,
      costCenter,
    } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (from === to) {
      return res.status(400).json({ error: "From and To ledger cannot be same" });
    }

    const fromLedger = await Ledger.findById(from);
    const toLedger = await Ledger.findById(to);

    if (!fromLedger || !toLedger) {
      return res.status(400).json({ error: "Invalid ledger" });
    }

    const payment = await Payment.create({
      paymentNo,
      date,
      from: { id: fromLedger._id, name: fromLedger.name },
      to: { id: toLedger._id, name: toLedger.name },
      referenceNo,
      amount: Number(amount),
      description,
      paymentFor,
      invoice,
      costCenter,
      status: "Draft",
      createdBy: req.user._id,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const postPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.status !== "Draft") {
      return res.status(400).json({
        error: "Only Draft payment can be posted",
      });
    }

    await applyPaymentToLedgers(payment, "add");

    payment.status = "Posted";
    await payment.save();

    res.json({ message: "Payment posted successfully", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.status !== "Posted") {
      return res.status(400).json({
        error: "Only Posted payment can be cancelled",
      });
    }

    await applyPaymentToLedgers(payment, "subtract");

    payment.status = "Cancelled";
    await payment.save();

    res.json({ message: "Payment cancelled successfully", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "Draft") {
      return res.status(400).json({
        message: "Posted or cancelled payment cannot be edited",
      });
    }

    Object.assign(payment, req.body);
    await payment.save();

    res.json({ message: "Payment updated successfully", payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('from.id to.id invoice.id');
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get a single payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('from.id to.id invoice.id');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }
    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete a payment
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "Draft") {
      return res.status(400).json({
        message: "Only Draft payment can be deleted",
      });
    }

    await payment.deleteOne();
    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  createPayment,
  getPaymentById,
  getPayments,
  updatePayment,
  deletePayment,
  generatePaymentNo,
  postPayment,
  cancelPayment
}