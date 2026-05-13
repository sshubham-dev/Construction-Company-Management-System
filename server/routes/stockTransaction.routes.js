const express = require("express");

const Stock_Transaction = express.Router();

const {

  createStockTransaction,
  getStockTransactions,
} = require("../controller/stock.controller");

/* =========================
   TRANSACTION
========================= */

Stock_Transaction
  .route("/")
  .post(createStockTransaction)
  .get(getStockTransactions);

module.exports = Stock_Transaction;