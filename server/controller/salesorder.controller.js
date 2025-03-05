const SalesOrder = require('../models/saleorder.models');

// Create a new sales order
const createSalesOrder = async (req, res) => {
    try {
        const salesOrder = new SalesOrder(req.body);
        await salesOrder.save();
        res.status(201).json(salesOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all sales orders
const getAllSalesOrders = async (req, res) => {
    try {
        const salesOrders = await SalesOrder.find();
        res.status(200).json(salesOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific sales order by ID
const getSalesOrderById = async (req, res) => {
    try {
        const salesOrder = await SalesOrder.findById(req.params.id);
        if (!salesOrder) {
            return res.status(404).json({ message: 'Sales order not found' });
        }
        res.status(200).json(salesOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a sales order by ID
const updateSalesOrder = async (req, res) => {
    try {
        const updatedSalesOrder = await SalesOrder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSalesOrder) {
            return res.status(404).json({ message: 'Sales order not found' });
        }
        res.status(200).json(updatedSalesOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a sales order by ID
const deleteSalesOrder = async (req, res) => {
    try {
        const deletedSalesOrder = await SalesOrder.findByIdAndDelete(req.params.id);
        if (!deletedSalesOrder) {
            return res.status(404).json({ message: 'Sales order not found' });
        }
        res.status(200).json({ message: 'Sales order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSalesOrder,
    getAllSalesOrders, 
    getSalesOrderById,
    updateSalesOrder,
    deleteSalesOrder
}