const mongoose = require("mongoose");
const { DeliveryNote, SiteReceipt } = require("../models/deliverynote.models");
const PurchaseRequest = require("../models/purchaserequest.models");


/* =====================================
   GENERATE DN NUMBER
===================================== */
const generateDeliveryNoteNo = async () => {
  const year = new Date().getFullYear();

  const lastDN = await DeliveryNote.findOne({
    deliveryNoteNo: new RegExp(`^DN-${year}-`),
  })
    .sort({ createdAt: -1 })
    .select("deliveryNoteNo")
    .lean();

  let nextNumber = 1;

  if (lastDN?.deliveryNoteNo) {
    const lastSeq = parseInt(lastDN.deliveryNoteNo.split("-").pop(), 10);
    if (!isNaN(lastSeq)) nextNumber = lastSeq + 1;
  }

  return `DN-${year}-${String(nextNumber).padStart(6, "0")}`;
};

/* =====================================
   CREATE DELIVERY NOTE (STORE ISSUE)
===================================== */
const createDeliveryNote = async (req, res) => {
  try {
    const { purchaseRequestId, fromStoreId, toStoreId, items } = req.body;

    const pr = await PurchaseRequest.findById(purchaseRequestId);
    if (!pr) throw new Error("PR not found");

    const dnItems = items.map(i => {
      const prItem = pr.items.find(
        p => p.itemId.toString() === i.itemId
      );

      if (!prItem) throw new Error("Invalid PR item");

      const pending = prItem.requestedQty - prItem.issuedQty;

      if (i.issuedQty > pending) {
        throw new Error("Exceeds pending qty");
      }

      return {
        itemId: prItem.itemId,
        unit: prItem.unit,
        requestedQty: prItem.requestedQty,
        issuedQty: i.issuedQty,
        acceptedQty: 0,
        rejectedQty: 0,
      };
    });

    const dn = await DeliveryNote.create({
      dnNo: `DN-${Date.now()}`,
      purchaseRequestId,
      fromStoreId,
      toStoreId,
      issuedBy: req.user._id,
      items: dnItems,
      status: "ISSUED",
    });

    res.status(201).json({ success: true, data: dn });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   RECEIVE DELIVERY NOTE (SITE )
===================================== */
const receiveDeliveryNote = async (req, res) => {
  try {
    const dn = await DeliveryNote.findById(req.params.id);

    if (!dn || dn.status !== "ISSUED") {
      throw new Error("Invalid DN state");
    }

    let mismatch = false;

    dn.items.forEach(dnItem => {
      const payload = req.body.items.find(
        i => i.itemId.toString() === dnItem.itemId.toString()
      );

      if (!payload) return;

      if (payload.acceptedQty + payload.rejectedQty !== dnItem.issuedQty) {
        mismatch = true;
      }

      dnItem.acceptedQty = payload.acceptedQty;
      dnItem.rejectedQty = payload.rejectedQty;
      dnItem.rejectionReason = payload.rejectionReason || "";
    });

    dn.status = mismatch ? "MISMATCH" : "RECEIVED";
    dn.receivedBy = req.user._id;
    dn.receivedDate = new Date();

    await dn.save();

    res.json({ success: true, data: dn });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   CONFIRM DELIVERY NOTE (CORE ENGINE)
===================================== */
const verifyDeliveryNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dn = await DeliveryNote.findById(req.params.id).session(session);

    if (!dn || dn.status !== "RECEIVED") {
      throw new Error("Invalid DN state");
    }

    const pr = await PurchaseRequest.findById(dn.purchaseRequestId).session(session);
    if (!pr) throw new Error("PR not found");

    for (const item of dn.items) {
      const issued = item.issuedQty;
      const accepted = Number(item.acceptedQty || 0);
      const rejected = Number(item.rejectedQty || 0);

      /* =========================
         VALIDATION (IMPORTANT)
      ========================== */
      if (accepted + rejected !== issued) {
        throw new Error(`Qty mismatch for item ${item.itemId}`);
      }

      /* =========================
         ACCEPTED → STOCK TRANSFER
      ========================== */
      if (accepted > 0) {
        await executeStockTransaction({
          itemId: item.itemId,
          fromStoreId: dn.fromStoreId,
          toStoreId: dn.toStoreId,
          quantity: accepted,
          rate: 0,
          type: "TRANSFER",
          source: "DN",
          referenceId: dn._id,
          userId: req.user._id,
          session, // ✅ IMPORTANT
        });
      }

      /* =========================
         REJECTED → RETURN BACK
      ========================== */
      if (rejected > 0) {
        await executeStockTransaction({
          itemId: item.itemId,
          fromStoreId: dn.toStoreId,
          toStoreId: dn.fromStoreId,
          quantity: rejected,
          rate: 0,
          type: "TRANSFER",
          source: "DN_REJECT",
          referenceId: dn._id,
          userId: req.user._id,
          session,
        });
      }

      /* =========================
         UPDATE PR
      ========================== */
      const prItem = pr.items.find(
        (i) => i.itemId.toString() === item.itemId.toString()
      );

      if (prItem && accepted > 0) {
        prItem.issuedQty += accepted;

        // safety cap
        if (prItem.issuedQty > prItem.requestedQty) {
          prItem.issuedQty = prItem.requestedQty;
        }
      }
    }

    /* =========================
       UPDATE PR STATUS
    ========================== */
    updatePRStatus(pr);

    /* =========================
       UPDATE DN
    ========================== */
    dn.status = "VERIFIED";
    dn.receivedDate = new Date();

    await pr.save({ session });
    await dn.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, data: dn });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET
===================================== */
const getDeliveryNotes = async (req, res) => {
  const dns = await DeliveryNote.find().sort({ createdAt: -1 });
  res.json(dns);
};

const getDeliveryNoteById = async (req, res) => {
  const dn = await DeliveryNote.findById(req.params.id);
  res.json(dn);
};



const createSiteReceipt = async (req, res) => {
  try {
    const { poId } = req.body;

    const po = await PurchaseOrder.findById(poId);

    if (!po) throw new Error("PO not found");

    if (po.deliveryType !== "SITE") {
      throw new Error("Not a site delivery PO");
    }

    const items = po.items.map(i => ({
      itemId: i.itemId,
      poItemId: i._id,
      orderedQty: i.quantity,
      receivedQty: 0,
      rejectedQty: 0,
      rate: i.rate,
      amount: 0,
    }));

    const receipt = await SiteReceipt.create({
      receiptNo: `SR-${Date.now()}`,
      poId,
      supplierId: po.supplierId,
      siteId: po.siteId,
      items,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: receipt });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const postSiteReceipt = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receipt = await SiteReceipt.findById(req.params.id).session(session);

    if (!receipt) throw new Error("Not found");
    if (receipt.status !== "VERIFIED") {
      throw new Error("Not verified");
    }

    const po = await PurchaseOrder.findById(receipt.poId).session(session);

    for (const item of receipt.items) {
      if (item.receivedQty <= 0) continue;

      await executeStockTransaction({
        itemId: item.itemId,
        toStoreId: receipt.siteId,
        quantity: item.receivedQty,
        rate: item.rate,
        type: "IN",
        source: "SITE_RECEIPT",
        referenceId: receipt._id,
        userId: req.user._id,
      });

      const poItem = po.items.id(item.poItemId);
      poItem.receivedQty += item.receivedQty;
    }

    po.updateStatus();
    await po.save({ session });

    receipt.status = "POSTED";
    await receipt.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, data: receipt });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: err.message });
  }
};



module.exports = {
  createDeliveryNote,
  receiveDeliveryNote,
  verifyDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,

  createSiteReceipt,
  postSiteReceipt,
};
