const Payment = require('../models/payment.models');
const { Ledger } = require("../models/ledger.models");

// Create a payment
const createPayment = async (req, res) => {
  try {
    const { paymentNo, date, from, to, receiptDetails, amount, description } = req.body;
    console.log(req.body)
    const existingFrom = await Ledger.findById(from);
    const existingTo = await Ledger.findById(to);
    const newPayment = new Payment({
      paymentNo,
      date,
      from: {
        name: existingFrom.name,
        id: existingFrom._id,
      },
      to: {
        name: existingTo.name,
        id: existingTo._id,
      },
      receiptDetails,
      amount,
      description,
    });
    await newPayment.save();
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: newPayment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
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
  deletePayment
}