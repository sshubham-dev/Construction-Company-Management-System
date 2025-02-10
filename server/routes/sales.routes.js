const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Create a sale
router.post('/', salesController.createSale);

// Get all sales
router.get('/', salesController.getSales);

// Get a sale by ID
router.get('/:id', salesController.getSaleById);

// Update a sale
router.put('/:id', salesController.updateSale);

// Delete a sale
router.delete('/:id', salesController.deleteSale);

module.exports = router;
