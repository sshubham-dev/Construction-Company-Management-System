const DeliveryNote = require("../models/deliverynote.models");
const { StoreInventory, StockTransfer } = require("../models/store.models");
const mongoose = require("mongoose");
// const SiteInventory = require("../models/siteInventory.model"); // if you create
const PurchaseRequest = require("../models/purchaserequest.models");
const { createSalesInvoiceFromDN } = require("./salesinvoice.controller");


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
    const user = req.user;
    const { purchaseRequestId, store, destination, items, remarks, deliveryTo } = req.body;

    if (!purchaseRequestId) {
      return res.status(400).json({ error: "Purchase Request required" });
    }

    if (!items?.length) {
      return res.status(400).json({ error: "Items required" });
    }

    const pr = await PurchaseRequest.findById(purchaseRequestId);
    if (!pr) return res.status(404).json({ error: "PR not found" });

    const prItemMap = new Map(pr.items.map((i) => [i.itemId.toString(), i]));

    const dnItems = [];

    for (const item of items) {
      const prItem = prItemMap.get(item.itemId.toString());

      if (!prItem) {
        return res.status(400).json({
          error: `Item ${item.item} not in PR`,
        });
      }

      const issuedQty = Number(item.issuedQty);

      if (issuedQty <= 0) {
        return res.status(400).json({
          error: `Invalid qty for ${item.item}`,
        });
      }

      if (issuedQty > prItem.requestedQty - prItem.issuedQty) {
        return res.status(400).json({
          error: `Exceeds pending qty for ${item.item}`,
        });
      }

      dnItems.push({
        itemId: prItem.itemId,
        item: prItem.item,
        unit: prItem.unit,
        requestedQty: prItem.requestedQty,
        issuedQty,
        acceptedQty: 0,
        rejectedQty: 0,
        status: "Issued",
      });
    }

    const dn = await DeliveryNote.create({
      deliveryNoteNo: await generateDeliveryNoteNo(),
      purchaseRequestId: pr._id,

      store: {
        id: store?.id,
        name: store?.name,
      },

      destination: {
        id: destination.id,
        deliveryTo: destination.deliveryTo,
        name: destination.name,
      },

      issuedBy: user._id,
      issueDate: new Date(),

      items: dnItems,

      status: "Issued",
    });

    res.status(201).json({ dn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* =====================================
   CONFIRM DELIVERY NOTE (CORE ENGINE)
===================================== */
const confirmDeliveryNote = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;
    const { items } = req.body;

    const dn = await DeliveryNote.findById(req.params.id).session(session);
    if (!dn || dn.status !== "Issued") {
      throw new Error("Invalid DN state");
    }

    const pr = await PurchaseRequest.findById(dn.purchaseRequestId).session(
      session,
    );
    if (!pr) throw new Error("PR not found");

    let hasMismatch = false;

    for (const item of dn.items) {
      if (item.acceptedQty <= 0) continue;

      await applyStoreStockMovement({
        storeId: dn.store.id,
        stockId: item.itemId,
        quantity: item.acceptedQty,
        direction: "OUT",
        type: "DN",
        referenceType: "DN",
        referenceId: dn._id,
        createdBy: user._id,
        session,
      });
    }

    for (const payloadItem of items) {
      const dnItem = dn.items.find(
        (i) => i.itemId.toString() === payloadItem.itemId.toString(),
      );

      if (!dnItem) throw new Error("Invalid DN item");

      const acceptedQty = Number(payloadItem.acceptedQty) || 0;
      const rejectedQty = Number(payloadItem.rejectedQty) || 0;

      if (acceptedQty < 0 || rejectedQty < 0) {
        throw new Error("Negative qty not allowed");
      }

      if (acceptedQty + rejectedQty !== dnItem.issuedQty) {
        dnItem.status = "Mismatch";
        hasMismatch = true;
        continue;
      }

      if (rejectedQty > 0 && !payloadItem.rejectionReason) {
        throw new Error(`Rejection reason required for ${dnItem.item}`);
      }

      /* ===== STORE INVENTORY CHECK ===== */
      const storeInv = await StoreInventory.findOne({
        storeId: dn.store.id,
        stockId: dnItem.itemId,
      }).session(session);

      if (!storeInv || storeInv.quantity < acceptedQty) {
        throw new Error(`Insufficient stock for ${dnItem.item}`);
      }

      /* ===== STORE ↓ ===== */
      storeInv.quantity -= acceptedQty;
      await storeInv.save({ session });

      /* ===== TRANSFER ENTRY ===== */
      await StockTransfer.create(
        [
          {
            stockId: dnItem.itemId,
            quantity: acceptedQty,
            rate: dnItem.costRate || 0,
            fromType: "Store",
            fromId: dn.store.id,
            toType: "Site",
            toId: dn.site.id,
            referenceType: "DN",
            referenceId: dn._id,
            createdBy: user._id,
          },
        ],
        { session },
      );

      /* ===== PR UPDATE ===== */
      const prItem = pr.items.find(
        (i) => i.itemId.toString() === dnItem.itemId.toString(),
      );

      if (prItem) {
        prItem.issuedQty += acceptedQty;
      }

      /* ===== DN UPDATE ===== */
      dnItem.acceptedQty = acceptedQty;
      dnItem.rejectedQty = rejectedQty;
      dnItem.rejectionReason = payloadItem.rejectionReason || "";
      dnItem.status = "Verified";
    }

    /* ===== FINAL STATUS ===== */
    if (hasMismatch) {
      dn.status = "Mismatch";
    } else {
      dn.status = "Verified";
      dn.receivedBy = user._id;
      dn.receivedDate = new Date();
    }

    await pr.save({ session });
    await dn.save({ session });

    /* ===== INVOICE ===== */
    let invoice = null;

    if (dn.status === "Verified") {
      invoice = await createSalesInvoiceFromDN(dn, user._id, session);

      dn.salesInvoiceId = invoice._id;
      await dn.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      dn,
      invoiceId: invoice?._id || null,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error(err);
    res.status(500).json({ error: err.message });
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

module.exports = {
  createDeliveryNote,
  confirmDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,
};
