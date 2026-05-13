const express = require("express");
const StockAudit = express.Router();
const {
    createStockAudit,
    updateStockAudit,
    approveStockAudit,
    postStockAudit,
    getStockAudits,
    getStockAuditById,
    deleteStockAudit,
} = require("../controller/stockaudit.controller")

StockAudit.get("/", getStockAudits)
StockAudit.get("/", getStockAuditById)
StockAudit.post("/", createStockAudit)
StockAudit.put("/:id", updateStockAudit)
StockAudit.put("/:id", approveStockAudit)
StockAudit.delete("/:id", deleteStockAudit)

module.exports = StockAudit;