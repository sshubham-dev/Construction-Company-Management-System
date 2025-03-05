const express = require('express');
const Sales = express.Router();
const {createSale, getSaleById, getSales, updateSale, deleteSale} = require('../controller/sales.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create a sale
Sales.post('/', createSale);

// Get all sales
Sales.get('/', getSales);

// Get a sale by ID
Sales.get('/:id', getSaleById);

// Update a sale
Sales.put('/:id', updateSale);

// Delete a sale
Sales.delete('/:id', deleteSale);

module.exports = Sales;
