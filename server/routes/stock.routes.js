const express = require('express');
const Stock = express.Router();
const Stock_Group = express.Router();
const stockController = require('../controllers/stockController');

// Stock routes
Stock.post('/stocks', stockController.createStock);
Stock.get('/stocks', stockController.getStocks);
Stock.get('/stocks/:id', stockController.getStockById);
Stock.put('/stocks/:id', stockController.updateStock);
Stock.delete('/stocks/:id', stockController.deleteStock);

// Stock Group routes
Stock_Group.post('/stock-groups', stockController.createStockGroup);
Stock_Group.get('/stock-groups', stockController.getStockGroups);
Stock_Group.get('/stock-groups/:id', stockController.getStockGroupById);
Stock_Group.put('/stock-groups/:id', stockController.updateStockGroup);
Stock_Group.delete('/stock-groups/:id', stockController.deleteStockGroup);

module.exports = router;
