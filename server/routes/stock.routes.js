const express = require("express");

const Stock = express.Router();

const {
  getStocks,
  getStockById,
  getStockSummary,
  getItemStock,
  getStoreStock,

} = require("../controller/stock.controller");

/* =========================
   STOCK
========================= */

Stock.get("/", getStocks);

Stock.get("/summary", getStockSummary);


Stock.get("/store/:storeId", getStoreStock);
Stock.get("/:itemId", getItemStock);

Stock.get("/:id", getStockById);
module.exports = Stock;