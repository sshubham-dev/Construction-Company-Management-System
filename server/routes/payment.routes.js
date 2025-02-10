const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Routes for payments
router.post('/payments', paymentController.createPayment);  // Create
router.get('/payments', paymentController.getPayments);  // Read all
router.get('/payments/:id', paymentController.getPaymentById);  // Read by ID
router.put('/payments/:id', paymentController.updatePayment);  // Update
router.delete('/payments/:id', paymentController.deletePayment);  // Delete

module.exports = router;
