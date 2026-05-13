const mongoose = require("mongoose");
const { StockAudit, Stock } = require("../models/stock.models");
const { executeStockTransaction } = require("../services/Inventory/stock.service");

/* =========================
   CREATE STOCK AUDIT
========================= */
const createStockAudit = async (req, res) => {
  try {
    const { storeId } = req.body;

    if (!storeId) throw new Error("Store required");

    // 🔥 load stock instead of StoreInventory
    const stocks = await Stock.find({ storeId });

    const items = stocks.map((s) => ({
      itemId: s.itemId,
      systemQty: s.quantity,
      physicalQty: s.quantity,
      difference: 0,
      rate: s.avgRate,
      value: 0,
    }));

    const audit = await StockAudit.create({
      storeId,
      items,
      auditedBy: req.user._id,
      status: "DRAFT",
    });

    res.status(201).json({ success: true, data: audit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   UPDATE AUDIT (COUNTING)
========================= */
const updateStockAudit = async (req, res) => {
  try {
    const audit = await StockAudit.findById(req.params.id);

    if (!audit) throw new Error("Audit not found");

    if (audit.status !== "DRAFT") {
      throw new Error("Only draft audit can be edited");
    }

    const { items } = req.body;

    audit.items = items.map((i) => {
      const diff = (i.physicalQty || 0) - (i.systemQty || 0);

      return {
        itemId: i.itemId,
        systemQty: i.systemQty,
        physicalQty: i.physicalQty,
        difference: diff,
        differenceType:
          diff === 0 ? "MATCH" : diff > 0 ? "EXCESS" : "SHORTAGE",
        rate: i.rate || 0,
        value: diff * (i.rate || 0),
        remarks: i.remarks,
      };
    });

    audit.status = "COUNTED";

    await audit.save();

    res.json({ success: true, data: audit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



/* =========================
   APPROVE AUDIT
========================= */
const approveStockAudit = async (req, res) => {
  try {
    const audit = await StockAudit.findById(req.params.id);

    if (!audit) throw new Error("Audit not found");

    if (audit.status !== "COUNTED") {
      throw new Error("Only counted audit can be approved");
    }

    audit.status = "APPROVED";
    audit.approvedBy = req.user._id;

    await audit.save();

    res.json({ success: true, data: audit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



/* =========================
   POST AUDIT (ADJUST STOCK)
========================= */
const postStockAudit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const audit = await StockAudit.findById(req.params.id).session(session);

    if (!audit) throw new Error("Audit not found");

    if (audit.status !== "APPROVED") {
      throw new Error("Audit must be approved before posting");
    }

    for (const item of audit.items) {
      if (item.difference === 0) continue;

      await executeStockTransaction({
        itemId: item.itemId,
        toStoreId: audit.storeId,
        fromStoreId: audit.storeId,
        quantity: Math.abs(item.difference),
        rate: item.rate,
        type: item.difference > 0 ? "IN" : "OUT",
        source: "ADJUSTMENT",
        referenceId: audit._id,
        userId: req.user._id,
      });
    }

    audit.status = "ADJUSTED";
    audit.postedAt = new Date();

    await audit.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Stock audit adjusted successfully",
      audit,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ success: false, message: err.message });
  }
};



/* =========================
   GET AUDITS
========================= */
const getStockAudits = async (req, res) => {
  const data = await StockAudit.find()
    .populate("storeId auditedBy approvedBy")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
};


const getStockAuditById = async (req, res) => {
  const audit = await StockAudit.findById(req.params.id)
    .populate("storeId auditedBy approvedBy");

  if (!audit) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.json({ success: true, data: audit });
};


/* =========================
   DELETE AUDIT
========================= */
const deleteStockAudit = async (req, res) => {
  try {
    const audit = await StockAudit.findById(req.params.id);

    if (!audit) throw new Error("Not found");

    if (audit.status !== "DRAFT") {
      throw new Error("Only draft audit can be deleted");
    }

    await audit.deleteOne();

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createStockAudit,
  updateStockAudit,
  approveStockAudit,
  postStockAudit,
  getStockAudits,
  getStockAuditById,
  deleteStockAudit,
};