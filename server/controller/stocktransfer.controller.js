const mongoose = require("mongoose");
const { Stock_Transfer  } = require("../models/stock.models");
const {applyStoreStockMovement }= require("../models/store.models");

const generateTransferNo = async () => {
  const year = new Date().getFullYear();

  const last = await StockTransfer.findOne({
    transferNo: new RegExp(`^ST-${year}-`),
  })
    .sort({ createdAt: -1 })
    .lean();

  let next = 1;

  if (last?.transferNo) {
    const lastSeq = parseInt(last.transferNo.split("-").pop(), 10);
    if (!isNaN(lastSeq)) next = lastSeq + 1;
  }

  return `ST-${year}-${String(next).padStart(5, "0")}`;
};

const createStockTransfer = async (req, res) => {
  try {
    const { fromStoreId, toStoreId, items } = req.body;

    if (!fromStoreId || !toStoreId) {
      throw new Error("Store required");
    }

    if (fromStoreId === toStoreId) {
      throw new Error("Cannot transfer to same store");
    }

    if (!items || !items.length) {
      throw new Error("Items required");
    }

    const transfer = await StockTransfer.create({
      transferNo: await generateTransferNo(),
      fromStoreId,
      toStoreId,
      items,
      createdBy: req.user._id,
    });

    res.status(201).json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateStockTransfer = async (req, res) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id);

    if (!transfer) throw new Error("Not found");

    if (transfer.status !== "Draft") {
      throw new Error("Only draft editable");
    }

    Object.assign(transfer, req.body);

    await transfer.save();

    res.json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const approveStockTransfer = async (req, res) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id);

    if (!transfer) throw new Error("Not found");

    if (transfer.status !== "Draft") {
      throw new Error("Invalid status");
    }

    transfer.status = "Approved";
    await transfer.save();

    res.json({ message: "Approved", transfer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const executeStockTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transfer = await StockTransfer.findById(req.params.id).session(session);

    if (!transfer) throw new Error("Transfer not found");

    if (!["Approved", "Draft"].includes(transfer.status)) {
      throw new Error("Invalid status");
    }

    /* =========================
       LOOP ITEMS
    ========================== */
    for (const item of transfer.items) {
      if (item.quantity <= 0) continue;

      /* ===== OUT from source ===== */
      await applyStoreStockMovement({
        storeId: transfer.fromStoreId,
        stockId: item.stockId,
        quantity: item.quantity,
        direction: "OUT",
        type: "TRANSFER",
        referenceType: "STOCK_TRANSFER",
        referenceId: transfer._id,
        narration: "Transfer OUT",
        createdBy: req.user._id,
        session,
      });

      /* ===== IN to destination ===== */
      await applyStoreStockMovement({
        storeId: transfer.toStoreId,
        stockId: item.stockId,
        quantity: item.quantity,
        rate: item.rate,
        direction: "IN",
        type: "TRANSFER",
        referenceType: "STOCK_TRANSFER",
        referenceId: transfer._id,
        narration: "Transfer IN",
        createdBy: req.user._id,
        session,
      });
    }

    transfer.status = "Completed";
    transfer.completedAt = new Date();

    await transfer.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Transfer completed successfully",
      transfer,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: err.message });
  }
};

const getStockTransfers = async (req, res) => {
  const data = await StockTransfer.find().sort({ createdAt: -1 });
  res.json(data);
};

const getStockTransferById = async (req, res) => {
  const transfer = await StockTransfer.findById(req.params.id);

  if (!transfer) return res.status(404).json({ error: "Not found" });

  res.json(transfer);
};

const deleteStockTransfer = async (req, res) => {
  try {
    const transfer = await StockTransfer.findById(req.params.id);

    if (!transfer) throw new Error("Not found");

    if (transfer.status !== "Draft") {
      throw new Error("Cannot delete");
    }

    await transfer.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createStockTransfer,
  updateStockTransfer,
  approveStockTransfer,
  executeStockTransfer,
  getStockTransfers,
  getStockTransferById,
  deleteStockTransfer,
};