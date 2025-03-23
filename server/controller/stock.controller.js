const { Stock, Stock_Group } = require('../models/stock.models');

// Create Stock
const createStock = async (req, res) => {
    try {
        console.log(req.body)
        const {
            name,
            code,
            category,
            unit,
            openingStock,
            cp,
            sp,
            mp,
            gstRate,
        } = req.body;
        const existingGroup = await Stock_Group.findById(category);
        const newStock = new Stock({
            name,
            code,
            category:{
                name:existingGroup.name,
                id: existingGroup._id,
            },
            unit,
            openingStock,
            cp,
            sp,
            mp,
            gstRate,
        });
        const savedStock = await newStock.save();
        res.status(201).json(savedStock);
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
};

// Get All Stocks
const getStocks = async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.status(200).json(stocks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get Stock by ID
const getStockById = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.status(200).json(stock);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update Stock
const updateStock = async (req, res) => {
    try {
        const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.status(200).json(stock);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete Stock
const deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findByIdAndDelete(req.params.id);
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.status(200).json({ message: 'Stock deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Create Stock Group
const createStockGroup = async (req, res) => {
    try {
        const {
            name,
            code,
            unit,
        } = req.body;
        const stockGroup = new Stock_Group({
            name,
            code,
            unit,
        });
        await stockGroup.save();
        res.status(201).json(stockGroup);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get All Stock Groups
const getStockGroups = async (req, res) => {
    try {
        const stockGroups = await Stock_Group.find();
        res.status(200).json(stockGroups);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get Stock Group by ID
const getStockGroupById = async (req, res) => {
    try {
        const stockGroup = await Stock_Group.findById(req.params.id);
        if (!stockGroup) {
            return res.status(404).json({ error: 'Stock Group not found' });
        }
        res.status(200).json(stockGroup);
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message });
    }
};

// Update Stock Group
const updateStockGroup = async (req, res) => {
    try {
        const stockGroup = await Stock_Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!stockGroup) {
            return res.status(404).json({ error: 'Stock Group not found' });
        }
        res.status(200).json(stockGroup);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete Stock Group
const deleteStockGroup = async (req, res) => {
    try {
        const stockGroup = await Stock_Group.findByIdAndDelete(req.params.id);
        if (!stockGroup) {
            return res.status(404).json({ error: 'Stock Group not found' });
        }
        res.status(200).json({ message: 'Stock Group deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { createStock, getStockById, getStocks, updateStock, deleteStock, createStockGroup, getStockGroupById, getStockGroups, updateStockGroup, deleteStockGroup };
