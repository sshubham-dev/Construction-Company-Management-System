const express = require('express');
const SalesOrders = express.Router();
const { createSalesOrder, getAllSalesOrders, getSalesOrderById, updateSalesOrder, deleteSalesOrder } = require('../controller/salesorder.controller')
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create a new sales order
SalesOrders.post('/', createSalesOrder);

// Get all sales orders
SalesOrders.get('/', getAllSalesOrders);

// Get a specific sales order by ID
SalesOrders.get('/:id', getSalesOrderById);

// Update a sales order by ID
SalesOrders.put('/:id', updateSalesOrder);

// Delete a sales order by ID
SalesOrders.delete('/:id', deleteSalesOrder);

module.exports = SalesOrders;
