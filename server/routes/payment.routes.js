const express = require('express');
const Payment = express.Router();
const {
    createPayment,
    getPaymentById,
    getPayments,
    updatePayment,
    deletePayment
} = require('../controller/payment.controller');

// Routes for payments
Payment.post('/', createPayment);  // Create
Payment.get('/', getPayments);  // Read all
Payment.get('/:id', getPaymentById);  // Read by ID
Payment.put('/:id', updatePayment);  // Update
Payment.delete('/:id', deletePayment);  // Delete

module.exports = Payment;
