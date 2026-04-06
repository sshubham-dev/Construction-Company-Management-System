const express = require('express');
const Stock = express.Router();
const Stock_Group = express.Router();
const {   createStock,
  getStockById,
  getStocks,
  updateStock,
  deleteStock,
  createStockGroup,
  getStockGroups,
  updateStockGroup,
  deleteStockGroup,
  getItemStock,
  getStockSummary,
  getStoreStock,
  adjustStock } = require('../controller/stock.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Stock routes
Stock.post('/', createStock);
Stock.get('/', getStocks);
Stock.get('/:id', getStockById);
Stock.put('/:id', updateStock);
Stock.delete('/:id', deleteStock);

// Stock Group routes
Stock_Group.post('/', createStockGroup);
Stock_Group.get('/', getStockGroups);
// Stock_Group.get('/:id', getStockGroupById);
Stock_Group.put('/:id', updateStockGroup);
Stock_Group.delete('/:id', deleteStockGroup);

module.exports = { Stock, Stock_Group };
