const express = require("express");
const Item = express.Router();


const {
    createStockItem,
    getStockItems,
    getStockItemById,
    updateStockItem,
    deleteStockItem,
} = require("../controller/stock.controller");
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');


/* =========================
   ITEM
========================= */

Item.post("/", userAuth, createStockItem);

Item.get("/", getStockItems);

Item.get("/:id", getStockItemById);

Item.put("/:id", updateStockItem);

Item.delete("/:id", deleteStockItem);


module.exports = Item;