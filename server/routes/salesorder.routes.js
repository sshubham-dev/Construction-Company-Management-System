const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Create a new sales order
router.post('/salesorders', salesController.createSalesOrder);

// Get all sales orders
router.get('/salesorders', salesController.getAllSalesOrders);

// Get a specific sales order by ID
router.get('/salesorders/:id', salesController.getSalesOrderById);

// Update a sales order by ID
router.put('/salesorders/:id', salesController.updateSalesOrder);

// Delete a sales order by ID
router.delete('/salesorders/:id', salesController.deleteSalesOrder);

module.exports = router;
