const express = require('express');
const Payment = express.Router();
const {
  createPayment,
  updatePayment,
  getPayments,
  getPaymentById,
  deletePayment,
  postPayment,
  cancelPayment,
} = require('../controller/payment.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Routes for payments
Payment.post('/', userAuth, createPayment);  // Create
Payment.get('/', userAuth, getPayments);  // Read all
Payment.put('/post/:id', userAuth, postPayment);  // Create
Payment.put('/cancel/:id', userAuth, cancelPayment);  // Create
// Payment.get('/next-voucher', generatePaymentNo);
Payment.get('/:id', userAuth, getPaymentById);  // Read by ID
Payment.put('/:id', userAuth, updatePayment);  // Update
Payment.delete('/:id', userAuth, deletePayment);  // Delete

module.exports = Payment;
