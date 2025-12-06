const Sales = require('../models/sales.models');
const { sendNotification } = require("./notification.controller.js");

// Create a new sale
const createSale = async (req, res) => {
  try {
    const sale = new Sales(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sales.find().populate('customerAccount').populate('items.item').populate('createdBy');
    res.status(200).json(sales);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single sale by ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id)
      .populate('customerAccount')
      .populate('items.item')
      .populate('createdBy');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.status(200).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a sale
const updateSale = async (req, res) => {
  try {
    const sale = await Sales.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.status(200).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a sale
const deleteSale = async (req, res) => {
  try {
    const sale = await Sales.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.status(200).json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createSale, getSaleById, getSales, updateSale, deleteSale };
