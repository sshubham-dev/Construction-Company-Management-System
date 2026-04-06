// =====================================================
// BASIC INVENTORY SERVICE (PRODUCTION READY - FINAL)
// =====================================================

const mongoose = require("mongoose");
const {
  StoreInventory,
  InventoryTransaction,
} = require("../../models/store.models");

/**
 * CORE INVENTORY ENGINE
 * This is the ONLY place where stock changes
 */

const applyInventoryTransaction = async ({
  type,
  storeId,
  stockId,
  qty,
  rate = 0,
  fromStoreId = null,
  toStoreId = null,
  referenceType = null,
  referenceId = null,
  createdBy = null,
  narration = "",
  session,
}) => {
  if (!session) {
    throw new Error("Session is required for inventory transaction");
  }

  // ============================
  // GET OR CREATE INVENTORY
  // ============================
  let inventory = await StoreInventory.findOne({ storeId, stockId }).session(
    session,
  );

  if (!inventory) {
    inventory = new StoreInventory({
      storeId,
      stockId,
      quantity: 0,
      averageRate: 0,
      stockValue: 0,
      reservedQuantity: 0,
      lastPurchaseRate: 0,
    });
  }

  const oldQty = inventory.quantity;
  const oldRate = inventory.averageRate;

  let qtyIn = 0;
  let qtyOut = 0;

  // ============================
  // INWARD LOGIC
  // ============================
  if (["GRN", "TRANSFER_IN", "RETURN_IN", "OPENING"].includes(type)) {
    qtyIn = qty;

    const newQty = oldQty + qty;

    const newAvgRate =
      oldQty === 0 ? rate : (oldQty * oldRate + qty * rate) / newQty;

    inventory.quantity = newQty;
    inventory.averageRate = Number(newAvgRate.toFixed(4));
    inventory.lastPurchaseRate = rate;
  }

  // ============================
  // OUTWARD LOGIC
  // ============================
  else if (["DN", "TRANSFER_OUT", "RETURN_OUT"].includes(type)) {
    const availableQty = oldQty - (inventory.reservedQuantity || 0);

    if (qty > availableQty) {
      throw new Error("Insufficient stock available");
    }

    qtyOut = qty;
    inventory.quantity = oldQty - qty;

    // avgRate remains unchanged
  }

  // ============================
  // ADJUSTMENT (AUDIT)
  // ============================
  else if (type === "ADJUSTMENT") {
    if (qty >= 0) qtyIn = qty;
    else qtyOut = Math.abs(qty);

    inventory.quantity = oldQty + qty;

    if (inventory.quantity < 0) {
      throw new Error("Negative stock not allowed");
    }
  } else {
    throw new Error("Invalid transaction type");
  }

  // ============================
  // FINAL VALUE CALCULATION
  // ============================
  inventory.stockValue = Number(
    (inventory.quantity * inventory.averageRate).toFixed(2),
  );

  await inventory.save({ session });

  // ============================
  // CREATE TRANSACTION RECORD
  // ============================
  await InventoryTransaction.create(
    [
      {
        storeId,
        stockId,
        type,
        qtyIn,
        qtyOut,
        rate,
        value: Number((qty * rate).toFixed(2)),
        fromStoreId,
        toStoreId,
        referenceType,
        referenceId,
        createdBy,
        narration,
      },
    ],
    { session },
  );
};

// =====================================================
// WRAPPER (SAFE TRANSACTION HANDLER)
// =====================================================

const runInventoryTransaction = async (callback) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  applyInventoryTransaction,
  runInventoryTransaction,
};
