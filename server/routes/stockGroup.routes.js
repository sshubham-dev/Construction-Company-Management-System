const express = require("express");

const Stock_Group = express.Router();

const {
  createStockGroup,
  getStockGroups,
  getStockGroupById,
  updateStockGroup,
  deleteStockGroup,
} = require("../controller/stock.controller");

/* =========================
   STOCK GROUP
========================= */

Stock_Group.post("/", createStockGroup);

Stock_Group.get("/", getStockGroups);

Stock_Group.get("/:id", getStockGroupById);

Stock_Group.put("/:id", updateStockGroup);

Stock_Group.delete("/:id", deleteStockGroup);

module.exports = Stock_Group;
