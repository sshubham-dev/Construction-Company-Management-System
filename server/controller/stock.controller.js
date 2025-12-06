const { Stock, Stock_Group } = require("../models/stock.models");
const Store = require("../models/store.models");
const { sendNotification } = require("./notification.controller.js");

// Utility: calculate sale price
function calcSalePrice(stock) {
  const surcharge =
    (stock.surchargePercentage.staffSalary || 0) +
    (stock.surchargePercentage.profit || 0) +
    (stock.surchargePercentage.expenses || 0) +
    (stock.surchargePercentage.investment || 0) +
    (stock.surchargePercentage.tax || 0);

  return stock.purchasePrice + (stock.purchasePrice * surcharge) / 100;
}

// CREATE STOCK
const createStock = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.category || !data.unit) {
      return res.status(400).json({ error: "Name, category, unit required" });
    }

    const newStock = new Stock({
      ...data,
    });

    newStock.salePrice = calcSalePrice(newStock);

    newStock.movementLog.push({
      type: "Adjustment",
      narration: "Initial entry",
    });

    const saved = await newStock.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("Create Stock Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Stocks
const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();

    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Stock by ID
const getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }
    res.status(200).json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Stock
const updateStock = async (req, res) => {
  try {
    const data = req.body;

    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ error: "Stock not found" });

    Object.assign(stock, data);

    // Recalculate sale price
    stock.salePrice = calcSalePrice(stock);

    stock.movementLog.push({
      type: "Adjustment",
      narration: "Stock updated",
    });

    const updated = await stock.save();
    res.json(updated);
  } catch (err) {
    console.error("Update Stock Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete Stock
const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }
    res.status(200).json({ message: "Stock deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create Stock Group
const createStockGroup = async (req, res) => {
  try {
    const { name, code, unit } = req.body;
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
      return res.status(404).json({ error: "Stock Group not found" });
    }
    res.status(200).json(stockGroup);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

// Update Stock Group
const updateStockGroup = async (req, res) => {
  try {
    const stockGroup = await Stock_Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!stockGroup) {
      return res.status(404).json({ error: "Stock Group not found" });
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
      return res.status(404).json({ error: "Stock Group not found" });
    }
    res.status(200).json({ message: "Stock Group deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createStock,
  getStockById,
  getStocks,
  updateStock,
  deleteStock,
  createStockGroup,
  getStockGroupById,
  getStockGroups,
  updateStockGroup,
  deleteStockGroup,
};
