const mongoose = require("mongoose");

const GRN = require("../models/grn.models");
const PurchaseOrder = require("../models/purchaseOrder.models");

const { executeStockTransaction } = require("../services/Inventory/stock.service");

/* =========================
   GRN NUMBER
========================= */
async function generateGRNNo() {
  const last = await GRN.findOne().sort({ createdAt: -1 });

  const year = new Date().getFullYear();

  if (!last) return `GRN-${year}-0001`;

  const lastNumber = parseInt(last.grnNo.split("-")[2]) || 0;

  return `GRN-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
}

const createGRN = async (req, res) => {
  try {
    const { poId, items, narration } = req.body;

    const po = await PurchaseOrder.findById(poId);
    if (!po) throw new Error("PO not found");

    if (!["ORDERED", "PARTIAL"].includes(po.status)) {
      throw new Error("Invalid PO state");
    }

    const processedItems = items.map((i) => {
      const poItem = po.items.id(i.poItemId);
      if (!poItem) throw new Error("Invalid PO item");

      const pendingQty = poItem.quantity - poItem.receivedQty;

      if (i.receivedQty > pendingQty) {
        throw new Error("Exceeds pending quantity");
      }

      if (i.rejectedQty > i.receivedQty) {
        throw new Error("Invalid rejected qty");
      }

      return {
        itemId: poItem.itemId,
        poItemId: poItem._id,
        orderedQty: poItem.quantity,
        receivedQty: i.receivedQty,
        rejectedQty: i.rejectedQty || 0,
        rate: poItem.rate,
        amount: i.receivedQty * poItem.rate,
      };
    });

    const totalAmount = processedItems.reduce((a, i) => a + i.amount, 0);

    const grn = await GRN.create({
      grnNo: await generateGRNNo(),
      poId,
      supplierId: po.supplierId,
      storeId:
        po.deliveryType === "STORE" ? po.storeId : po.siteId,
      items: processedItems,
      totalAmount,
      status: "DRAFT",
      receivedBy: req.user._id,
      narration,
    });

    res.status(201).json({ success: true, data: grn });

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
    const grn = await GRN.findById(req.params.id).session(session);

    if (!grn) throw new Error("GRN not found");
    if (grn.status !== "DRAFT") throw new Error("Already posted");

    const po = await PurchaseOrder.findById(grn.poId).session(session);

    for (const item of grn.items) {
      const acceptedQty = item.receivedQty - item.rejectedQty;

      if (acceptedQty <= 0) continue;

      /* =========================
         STOCK ENTRY (CORRECT)
      ========================== */
      await executeStockTransaction({
        itemId: item.itemId,
        toStoreId: grn.storeId,
        quantity: acceptedQty,
        rate: item.rate,
        type: "IN",
        source: "GRN",
        referenceId: grn._id,
        userId: req.user._id,
      });

      /* =========================
         UPDATE PO
      ========================== */
      const poItem = po.items.id(item.poItemId);
      poItem.receivedQty += acceptedQty;
    }

    /* =========================
       UPDATE PO STATUS
    ========================== */
    po.updateStatus();
    await po.save({ session });

    /* =========================
       FINALIZE GRN
    ========================== */
    grn.status = "POSTED";
    grn.verifiedBy = req.user._id;

    await grn.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, data: grn });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: err.message });
  }
};

const cancelGRN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const grn = await GRN.findById(req.params.id).session(session);

    if (!grn) throw new Error("GRN not found");
    if (grn.status !== "POSTED") {
      throw new Error("Only posted GRN can cancel");
    }

    const po = await PurchaseOrder.findById(grn.poId).session(session);

    for (const item of grn.items) {
      const acceptedQty = item.receivedQty - item.rejectedQty;

      if (acceptedQty <= 0) continue;

      await executeStockTransaction({
        itemId: item.itemId,
        fromStoreId: grn.storeId,
        quantity: acceptedQty,
        rate: item.rate,
        type: "OUT",
        source: "GRN_CANCEL",
        referenceId: grn._id,
        userId: req.user._id,
      });

      const poItem = po.items.id(item.poItemId);
      poItem.receivedQty -= acceptedQty;
    }

    po.status = "ORDERED";
    await po.save({ session });

    grn.status = "CANCELLED";
    await grn.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: err.message });
  }
};

const listGRN = async (req, res) => {
  const data = await GRN.find()
    .populate("storeId supplierId poId")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
};

const getGRN = async (req, res) => {
  const data = await GRN.findById(req.params.id)
    .populate("storeId supplierId poId");

  res.json({ success: true, data });
};



module.exports = {
  createGRN,
  postGRN,
  cancelGRN,
  listGRN,
  getGRN,
  updateGRN,
};
