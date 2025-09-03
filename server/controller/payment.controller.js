const Payment = require('../models/payment.models');
const { Ledger } = require("../models/ledger.models");

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

const updateLedgersAndModels = async (receipt, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;
  const amount = parseFloat(receipt.amount);

  const fromLedger = await Ledger.findById(receipt.from.id);
  const toLedger = await Ledger.findById(receipt.to.id);

  if (fromLedger) {
    fromLedger.receivable = (fromLedger.receivable || 0) + multiplier * amount;
    fromLedger.received = (fromLedger.received || 0) + multiplier * amount;
    fromLedger.balance = (fromLedger.balance || 0) + multiplier * amount;
    fromLedger.transaction.push({ id: receipt._id, type: "Receipt", amount });
    await fromLedger.save();
  }

  if (toLedger) {
    toLedger.paid = (toLedger.paid || 0) + multiplier * amount;
    toLedger.balance = (toLedger.balance || 0) + multiplier * amount;
    toLedger.transaction.push({ id: receipt._id, type: "Receipt", amount });
    await toLedger.save();
  }

  // Update related models (PaymentSchedule, Client, Site)
  if (receipt.invoice?.length > 0) {
    for (const inv of receipt.invoice) {
      if (inv.type === "Payment_Schedule") {
        const schedule = await PaymentSchedule.findById(inv.id);
        if (schedule) {
          const amountPaid = schedule.amountPaid || 0;
          schedule.amountPaid = amountPaid + multiplier * amount;
          schedule.amountdue = Math.max(0, (schedule.totalValue || 0) - schedule.amountPaid);
          await schedule.save();
        }
      }
    }
  }
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
      invoiceType,
      invoice,
    } = req.body;

    // Create payment document
    const payment = new Payment({
      paymentNo,
      date,
      from: { id: from, name: (await Ledger.findById(from))?.name },
      to: { id: to, name: (await Ledger.findById(to))?.name },
      referenceNo,
      amount,
      description,
      paymentFor,
      invoiceType,
      invoice,
    });

    await payment.save();

    // Update ledger balances
    await updateLedgersAndModels(payment, "add");

    // Update ledger balances
    await Ledger.findByIdAndUpdate(from, { $inc: { paid: amount, balance: -amount } });
    await Ledger.findByIdAndUpdate(to, { $inc: { balance: amount } });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

// Update a payment
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('from.id to.id invoice.id');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete a payment
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  getPayments,
  updatePayment,
  deletePayment,
  generatePaymentNo
}