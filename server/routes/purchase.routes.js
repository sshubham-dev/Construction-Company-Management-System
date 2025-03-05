const express = require('express');
const router = express.Router();
const {
    createPurchase, getAllPurchases, getPurchaseById, updatePurchase, deletePurchase
} = require('../controller/purchase.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create purchase
router.post('/', createPurchase);

// Get all purchases
router.get('/', getAllPurchases);

// Get purchase by ID
router.get('/:id', getPurchaseById);

// Update purchase by ID
router.put('/:id', updatePurchase);

// Delete purchase by ID
router.delete('/:id', deletePurchase);

module.exports = router;
