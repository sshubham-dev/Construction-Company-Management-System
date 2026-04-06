const mongoose = require("mongoose");

const GRN = require("../models/grn.models");
const { Store, StoreInventory } = require("../models/store.models");
const Ledger = require("../models/ledger.models");
const PurchaseOrder = require("../models/purchaseOrder.models");


async function generateGRNNo(storeCode) {
  const count = await GRN.countDocuments();
  return `GRN/${storeCode}/${new Date().getFullYear()}/${String(
    count + 1,
  ).padStart(4, "0")}`;
}

const createGRN = async (req, res) => {
  try {
    const { date, storeId, supplierId, purchaseOrderId, items } = req.body;

    items.forEach((i) => {
      if (i.acceptedQty + i.rejectedQty !== i.receivedQty) {
        throw new Error("Accepted + Rejected must equal Received");
      }
    });

    const store = await Store.findById(storeId);
    if (!store) throw new Error("Invalid Store");

    const grnNo = await generateGRNNo(store.code);

    const round = (n) => Math.round(n * 100) / 100;

    let gross = 0;
    let gst = 0;

    const processedItems = items.map((i) => {
      const amount = round(i.acceptedQty * i.rate);
      const tax = i.gstRate ? round((amount * i.gstRate) / 100) : 0;

      gross += amount;
      gst += tax;

      return {
        ...i,
        amount,
        taxAmount: tax,
      };
    });

    const grn = await GRN.create({
      grnNo,
      date,
      storeId,
      supplierId,
      purchaseOrderId,
      items: processedItems,
      grossAmount: gross,
      gstAmount: gst,
      netAmount: gross + gst,
      createdBy: req.user._id,
      status: "Draft",
    });

    res.status(201).json(grn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id);
    if (!grn) throw new Error("GRN not found");

    if (grn.status !== "Draft") {
      throw new Error("Only Draft GRN can be edited");
    }

    const round = (n) => Math.round(n * 100) / 100;

    let gross = 0;
    let gst = 0;

    const items = req.body.items.map((i) => {
      if (i.acceptedQty + i.rejectedQty !== i.receivedQty) {
        throw new Error("Invalid quantities");
      }

      const amount = round(i.acceptedQty * i.rate);
      const tax = i.gstRate ? round((amount * i.gstRate) / 100) : 0;

      gross += amount;
      gst += tax;

      return {
        ...i,
        amount,
        taxAmount: tax,
      };
    });

    grn.items = items;
    grn.grossAmount = gross;
    grn.gstAmount = gst;
    grn.netAmount = gross + gst;

    await grn.save();

    res.json(grn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const postGRN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    const grn = await GRN.findById(req.params.id).session(session);

    if (!grn) throw new Error("GRN not found");
    if (grn.status !== "Draft") throw new Error("Already posted");

    let gross = 0;
    let gst = 0;

    for (const item of grn.items) {
      if (item.acceptedQty <= 0) continue;

      await applyStoreStockMovement({
        storeId: grn.storeId,
        stockId: item.stockId,
        quantity: item.acceptedQty,
        rate: item.rate,
        direction: "IN",
        type: "GRN",
        referenceType: "GRN",
        referenceId: grn._id,
        createdBy: user._id,
        session,
      });

      const amount = item.acceptedQty * item.rate;
      gross += amount;

      const tax = (amount * (item.gstRate || 0)) / 100;
      gst += tax;

      /* =========================
         INVENTORY UPDATE
      ========================== */
      let inventory = await StoreInventory.findOne({
        storeId: grn.storeId,
        stockId: item.stockId,
      }).session(session);

      if (!inventory) {
        inventory = new StoreInventory({
          storeId: grn.storeId,
          stockId: item.stockId,
        });
      }

      const newQty = inventory.quantity + item.acceptedQty;

      inventory.averageRate =
        newQty === 0
          ? 0
          : (inventory.quantity * inventory.averageRate +
              item.acceptedQty * item.rate) /
            newQty;

      inventory.quantity = newQty;
      inventory.lastPurchaseRate = item.rate;

      await inventory.save({ session });

      /* =========================
         TRANSFER ENTRY
      ========================== */
      await StockTransfer.create(
        [
          {
            stockId: item.stockId,
            quantity: item.acceptedQty,
            rate: item.rate,
            fromType: "Vendor",
            toType: "Store",
            toId: grn.storeId,
            referenceType: "GRN",
            referenceId: grn._id,
            createdBy: userId,
          },
        ],
        { session },
      );

      /* =========================
         UPDATE PO
      ========================== */
      if (grn.purchaseOrderId && item.poItemId) {
        await PurchaseOrder.updateOne(
          {
            _id: grn.purchaseOrderId,
            "items._id": item.poItemId,
          },
          {
            $inc: {
              "items.$.receivedQty": item.acceptedQty,
            },
          },
          { session },
        );
      }
    }

    /* =========================
       FINALIZE
    ========================== */
    grn.grossAmount = gross;
    grn.gstAmount = gst;
    grn.netAmount = gross + gst;
    grn.status = "Posted";
    grn.approvedBy = userId;

    await grn.save({ session });

    /* =========================
       CREATE PURCHASE INVOICE
    ========================== */
    const invoice = await createPurchaseInvoiceFromGRN(grn, userId, session);

    grn.purchaseInvoiceId = invoice._id;
    await grn.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ grn, purchaseInvoice: invoice });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: err.message });
  }
};

const cancelGRN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    const grn = await GRN.findById(req.params.id).session(session);

    if (!grn) throw new Error("GRN not found");
    if (grn.status !== "Posted") throw new Error("Only posted GRN can cancel");

    for (const item of grn.items) {
      if (item.acceptedQty <= 0) continue;

      const inventory = await StoreInventory.findOne({
        storeId: grn.storeId,
        stockId: item.stockId,
      }).session(session);

      if (!inventory || inventory.quantity < item.acceptedQty) {
        throw new Error("Insufficient stock for reversal");
      }

      inventory.quantity -= item.acceptedQty;

      await inventory.save({ session });

      await StockTransfer.create(
        [
          {
            stockId: item.stockId,
            quantity: item.acceptedQty,
            rate: item.rate,
            fromType: "Store",
            toType: "Vendor",
            toId: null,
            referenceType: "GRN_CANCEL",
            referenceId: grn._id,
            createdBy: userId,
          },
        ],
        { session },
      );

      /* PO REVERSE */
      if (grn.purchaseOrderId && item.poItemId) {
        await PurchaseOrder.updateOne(
          {
            _id: grn.purchaseOrderId,
            "items._id": item.poItemId,
          },
          {
            $inc: {
              "items.$.receivedQty": -item.acceptedQty,
            },
          },
          { session },
        );
      }
    }

    grn.status = "Cancelled";
    grn.cancelledBy = userId;
    grn.cancelledAt = new Date();

    await grn.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "GRN cancelled", grn });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: err.message });
  }
};

const listGRN = async (req, res) => {
  const grns = await GRN.find()
    .populate("storeId supplierId purchaseOrderId")
    .sort({ createdAt: -1 });
  res.json(grns);
};

const getGRN = async (req, res) => {
  const grn = await GRN.findById(req.params.id).populate(
    "storeId supplierId purchaseOrderId items.stockId",
  );
  res.json(grn);
};

module.exports = {
  createGRN,
  postGRN,
  cancelGRN,
  listGRN,
  getGRN,
  updateGRN,
};
