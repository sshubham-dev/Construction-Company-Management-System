const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Create purchase
router.post('/', purchaseController.createPurchase);

// Get all purchases
router.get('/', purchaseController.getAllPurchases);

// Get purchase by ID
router.get('/:id', purchaseController.getPurchaseById);

// Update purchase by ID
router.put('/:id', purchaseController.updatePurchase);

// Delete purchase by ID
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
