const mongoose = require("mongoose");
const { StockAudit  } = require("../models/stock.models");
const {StoreInventory, applyStoreStockMovement }= require("../models/store.models");



const createStockAudit = async (req, res) => {
  try {
    const { storeId } = req.body;

    if (!storeId) throw new Error("Store required");

    /* =========================
       LOAD CURRENT INVENTORY
    ========================== */
    const inventory = await StoreInventory.find({ storeId });

    const items = inventory.map((i) => ({
      stockId: i.stockId,
      systemQty: i.quantity,
      physicalQty: i.quantity, // default same
      difference: 0,
      rate: i.averageRate,
      valueDifference: 0,
    }));

    const audit = await StockAudit.create({
      storeId,
      items,
      createdBy: req.user._id,
    });

    res.status(201).json(audit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateStockAudit = async (req, res) => {
  try {
    const audit = await StockAudit.findById(req.params.id);

    if (!audit) throw new Error("Audit not found");

    if (audit.status === "Posted") {
      throw new Error("Cannot edit posted audit");
    }

    const { items } = req.body;

    audit.items = items.map((i) => {
      const diff = (i.physicalQty || 0) - (i.systemQty || 0);

      return {
        ...i,
        difference: diff,
        valueDifference: diff * (i.rate || 0),
      };
    });

    await audit.save();

    res.json(audit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const postStockAudit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const audit = await StockAudit.findById(req.params.id).session(session);

    if (!audit) throw new Error("Audit not found");

    if (audit.status === "Posted") {
      throw new Error("Already posted");
    }

    for (const item of audit.items) {
      const diff = item.physicalQty - item.systemQty;

      if (diff === 0) continue;

      await applyStoreStockMovement({
        storeId: audit.storeId,
        stockId: item.stockId,
        quantity: Math.abs(diff),
        rate: item.rate,
        direction: diff > 0 ? "IN" : "OUT",
        type: "ADJUSTMENT",
        referenceType: "STOCK_AUDIT",
        referenceId: audit._id,
        narration: "Stock Audit Adjustment",
        createdBy: req.user._id,
        session,
      });
    }

    audit.status = "Posted";
    audit.postedAt = new Date();

    await audit.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Stock audit posted successfully",
      audit,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: err.message });
  }
};

const getStockAudits = async (req, res) => {
  const data = await StockAudit.find().sort({ createdAt: -1 });
  res.json(data);
};

const getStockAuditById = async (req, res) => {
  const audit = await StockAudit.findById(req.params.id);

  if (!audit) return res.status(404).json({ error: "Not found" });

  res.json(audit);
};

const deleteStockAudit = async (req, res) => {
  try {
    const audit = await StockAudit.findById(req.params.id);

    if (!audit) throw new Error("Not found");

    if (audit.status === "Posted") {
      throw new Error("Cannot delete posted audit");
    }

    await audit.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createStockAudit,
  updateStockAudit,
  postStockAudit,
  getStockAudits,
  getStockAuditById,
  deleteStockAudit,
};