// services/stock.service.js

const mongoose = require("mongoose");
const { Stock, Stock_Transaction, Item } = require("../../models/stock.models");



async function initializeStockForItem(itemId, storeIds = []) {
  if (!storeIds.length) return;

  const bulk = storeIds.map((storeId) => ({
    insertOne: {
      document: {
        itemId,
        storeId,
        quantity: 0,
        reservedQty: 0,
        avgRate: 0,
        stockValue: 0,
        isActive: true,
      },
    },
  }));

  try {
    await Stock.bulkWrite(bulk, { ordered: false });
  } catch (err) {
    // ignore duplicate errors (already exists)
    if (err.code !== 11000) throw err;
  }
}

/* =========================
   INIT STOCK FOR NEW STORE
========================= */
async function initializeStockForStore(storeId) {
  const items = await Item.find({ isActive: true }).select("_id");

  if (!items.length) return;

  const bulk = items.map((item) => ({
    insertOne: {
      document: {
        itemId: item._id,
        storeId,
        quantity: 0,
        reservedQty: 0,
        avgRate: 0,
        stockValue: 0,
        isActive: true,
      },
    },
  }));

  try {
    await Stock.bulkWrite(bulk, { ordered: false });
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
}



/* =========================
   GET OR CREATE STOCK
========================= */
async function getOrCreateStock(itemId, storeId, session) {
  let stock = await Stock.findOne({ itemId, storeId }).session(session);

  if (!stock) {
    const created = await Stock.create([{
      itemId,
      storeId,
      quantity: 0,
      reservedQty: 0,
      avgRate: 0,
      stockValue: 0,
    }], { session });

    stock = created[0];
  }

  return stock;
}

/* =========================
   VALIDATE ITEM
========================= */
async function validateItem(itemId) {
  const item = await Item.findById(itemId).populate("groupId");

  if (!item) throw new Error("Invalid item");

  if (item.itemType !== "INVENTORY") {
    throw new Error("Item is not inventory");
  }

  if (!item.groupId?.affectsInventory) {
    throw new Error("Item does not affect inventory");
  }

  if (item.groupId?.isAsset) {
    throw new Error("Asset cannot move in stock");
  }

  return item;
}

/* =========================
   VALIDATE INPUT
========================= */
function validatePayload({ type, fromStoreId, toStoreId, quantity, rate }) {
  if (!quantity || quantity <= 0) {
    throw new Error("Invalid quantity");
  }

  if (type === "IN" && !toStoreId) {
    throw new Error("IN requires toStoreId");
  }

  if (type === "OUT" && !fromStoreId) {
    throw new Error("OUT requires fromStoreId");
  }

  if (type === "TRANSFER" && (!fromStoreId || !toStoreId)) {
    throw new Error("TRANSFER requires both stores");
  }

  if ((type === "IN" || type === "TRANSFER") && (!rate || rate < 0)) {
    throw new Error("Rate required for IN/TRANSFER");
  }
}

/* =========================
   MAIN STOCK ENGINE
========================= */
async function applyStockTransaction(payload, session) {
  const {
    itemId,
    fromStoreId,
    toStoreId,
    quantity,
    rate,
    type,
    source,
    referenceId,
    userId,
  } = payload;

  validatePayload(payload);
  await validateItem(itemId);

  /* =========================
     IDEMPOTENCY CHECK
  ========================== */
  if (referenceId && source) {
    const exists = await Stock_Transaction.findOne({
      referenceId,
      source,
    }).session(session);

    if (exists) return;
  }

  let fromStock, toStock;

  /* =========================
     ATOMIC OUT (SAFE)
  ========================== */
  if (type === "OUT" || type === "TRANSFER") {
    fromStock = await Stock.findOneAndUpdate(
      {
        itemId,
        storeId: fromStoreId,
        $expr: {
          $gte: [
            { $subtract: ["$quantity", "$reservedQty"] },
            quantity,
          ],
        },
      },
      {
        $inc: { quantity: -quantity },
        $set: { lastTransactionAt: new Date() },
      },
      { new: true, session }
    );

    if (!fromStock) {
      throw new Error("Insufficient stock");
    }

    fromStock.stockValue = fromStock.quantity * fromStock.avgRate;
    await fromStock.save({ session });
  }

  /* =========================
     IN / TRANSFER
  ========================== */
  if (type === "IN" || type === "TRANSFER") {
    toStock = await getOrCreateStock(itemId, toStoreId, session);

    const totalValue = toStock.stockValue + quantity * rate;
    const totalQty = toStock.quantity + quantity;

    toStock.quantity = totalQty;
    toStock.avgRate = totalQty ? totalValue / totalQty : 0;
    toStock.stockValue = totalValue;
    toStock.lastPurchaseRate = rate;
    toStock.lastTransactionAt = new Date();

    await toStock.save({ session });
  }

  /* =========================
     SAVE TRANSACTION
  ========================== */
  await Stock_Transaction.create([{
    itemId,
    fromStoreId,
    toStoreId,
    quantity,
    rate,
    type,
    source,
    referenceId,
    balanceAfter:
      type === "IN"
        ? toStock.quantity
        : type === "OUT"
        ? fromStock.quantity
        : toStock.quantity,
    createdBy: userId,
  }], { session });
}

/* =========================
   TRANSACTION WRAPPER
========================= */
async function executeStockTransaction(payload) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await applyStockTransaction(payload, session);

    await session.commitTransaction();
    session.endSession();

    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

/* =========================
   REVERSAL
========================= */
async function reverseStockTransaction(referenceId, source) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const txns = await Stock_Transaction.find({
      referenceId,
      source,
    }).session(session);

    for (let txn of txns) {
      await applyStockTransaction(
        {
          itemId: txn.itemId,
          fromStoreId: txn.toStoreId,
          toStoreId: txn.fromStoreId,
          quantity: txn.quantity,
          rate: txn.rate,
          type:
            txn.type === "IN"
              ? "OUT"
              : txn.type === "OUT"
              ? "IN"
              : "TRANSFER",
          source: "REVERSAL",
          referenceId: txn._id,
        },
        session
      );
    }

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = {
    initializeStockForItem,
  initializeStockForStore,
  executeStockTransaction,
  reverseStockTransaction,
};