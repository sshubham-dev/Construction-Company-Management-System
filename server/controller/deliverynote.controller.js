const DeliveryNote = require("../models/deliverynote.models");
const { StoreInventory } = require("../models/store.models");
// const SiteInventory = require("../models/siteInventory.model");
// const SalesInvoice = require("../models/salesInvoice.models");
const PurchaseRequest = require("../models/purchaserequest.models");
const { createSalesInvoiceFromDN } = require("./salesinvoice.controller");

const generateDeliveryNoteNo = async () => {
  const year = new Date().getFullYear();

  // Get last DN of current year
  const lastDN = await DeliveryNote.findOne({
    deliveryNoteNo: new RegExp(`^DN-${year}-`),
  })
    .sort({ createdAt: -1 })
    .select("deliveryNoteNo")
    .lean();

  let nextNumber = 1;

  if (lastDN?.deliveryNoteNo) {
    const lastSeq = parseInt(lastDN.deliveryNoteNo.split("-").pop(), 10);
    if (!isNaN(lastSeq)) {
      nextNumber = lastSeq + 1;
    }
  }

  return `DN-${year}-${String(nextNumber).padStart(6, "0")}`;
};

/* =====================================
   CREATE / DRAFT DELIVERY NOTE (STORE)
===================================== */
const createDeliveryNote = async (req, res) => {
  try {
    const user = req.user;
    const { purchaseRequestId, store, site, items, remarks } = req.body;

    /* ======================
       BASIC VALIDATION
    ====================== */
    if (!purchaseRequestId) {
      return res.status(400).json({ error: "Purchase Request is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }

    /* ======================
       FETCH PR
    ====================== */
    const pr = await PurchaseRequest.findById(purchaseRequestId);
    if (!pr) {
      return res.status(404).json({ error: "Purchase Request not found" });
    }

    /* ======================
       VALIDATE & BUILD ITEMS
    ====================== */
    const prItemMap = new Map(pr.items.map((i) => [i.itemId.toString(), i]));

    const dnItems = [];

    for (const item of items) {
      const prItem = prItemMap.get(item.itemId.toString());

      if (!prItem) {
        return res.status(400).json({
          error: `Item ${item.item} does not belong to this PR`,
        });
      }

      const issuedQty = Number(item.issuedQty);

      if (isNaN(issuedQty) || issuedQty <= 0) {
        return res.status(400).json({
          error: `Invalid issued quantity for ${item.item}`,
        });
      }

      if (issuedQty > prItem.requestedQty) {
        return res.status(400).json({
          error: `Issued quantity exceeds requested quantity for ${item.item}`,
        });
      }

      dnItems.push({
        itemId: prItem.itemId,
        item: prItem.item,
        unit: prItem.unit,
        requestedQty: prItem.requestedQty,
        issuedQty,
        status: "Issued",
      });
    }

    /* ======================
       CREATE DN
    ====================== */
    const dn = await DeliveryNote.create({
      deliveryNoteNo: await generateDeliveryNoteNo(),
      purchaseRequestId: pr._id,

      store: {
        id: store.id,
        name: store.name,
      },

      site: {
        id: site.id,
        name: site.name,
      },

      issuedBy: user._id,
      issueDate: new Date(),

      items: dnItems,
      remarks,

      status: "Issued",
    });

    res.status(201).json({
      message: "Delivery Note created successfully",
      dn,
    });
  } catch (err) {
    console.error("Create DN Error:", err);
    res.status(500).json({
      error: "Failed to create Delivery Note",
    });
  }
};

/* =====================================
   CONFIRM DELIVERY NOTE
   ↑ Stock increases to Site
   ↓ Stock decreases from Store
   → AUTO SALES INVOICE
===================================== */
const confirmDeliveryNote = async (req, res) => {
  try {
    const user = req.user;
    const { items } = req.body;
    // console.log(items)

    const dn = await DeliveryNote.findById(req.params.id);
    if (!dn || dn.status !== "Issued") {
      return res.status(400).json({ error: "Invalid DN state" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    let hasMismatch = false;

    for (const payloadItem of items) {
      console.log(dn.items.find(
        (item) => item.itemId.toString() === payloadItem.itemId.toString()
      ));
      const dnItem = dn.items.find(
        (item) => item.itemId.toString() === payloadItem.itemId.toString()
      );

      if (!dnItem) {
        return res.status(400).json({ error: "Invalid DN item" });
      }

      const acceptedQty = Number(payloadItem.acceptedQty) || 0;
      const rejectedQty = Number(payloadItem.rejectedQty) || 0;

      /* ======================
         CORE VALIDATION
      ====================== */
      if (acceptedQty < 0 || rejectedQty < 0) {
        return res.status(400).json({
          error: `Negative quantity not allowed for ${dnItem.item}`,
        });
      }

      if (acceptedQty + rejectedQty !== dnItem.issuedQty) {
        dnItem.status = "Mismatch";
        hasMismatch = true;
        continue;
      }

      if (rejectedQty > 0 && !payloadItem.rejectionReason) {
        return res.status(400).json({
          error: `Rejection reason required for ${dnItem.item}`,
        });
      }

      /* ======================
         APPLY CONFIRMATION
      ====================== */
      dnItem.acceptedQty = acceptedQty;
      dnItem.rejectedQty = rejectedQty;
      dnItem.rejectionReason = payloadItem.rejectionReason || "";
      dnItem.status = "Verified";
    }

    /* ======================
       FINAL DN STATUS
    ====================== */
    if (hasMismatch) {
      dn.status = "Mismatch";
    } else {
      dn.status = "Verified";
      dn.receivedBy = user._id;
      dn.receivedDate = new Date();
    }

    await dn.save();

    /* ======================
       SALES INVOICE (OPTIONAL)
    ====================== */
    let invoice = null;

    if (dn.status === "Verified") {
      invoice = await createSalesInvoiceFromDN(dn, user._id);
      dn.salesInvoiceId = invoice._id;
      await dn.save();
    }

    res.json({
      message:
        dn.status === "Verified"
          ? "Delivery verified successfully"
          : "Delivery mismatch detected",
      dn,
      invoiceId: invoice?._id || null,
    });
  } catch (err) {
    console.error("Confirm DN Error:", err);
    res.status(500).json({ error: "Failed to confirm delivery" });
  }
};

/* =====================================
   GET LIST / DETAIL
===================================== */
const getDeliveryNotes = async (req, res) => {
  const dns = await DeliveryNote.find().sort({ createdAt: -1 });
  res.json(dns);
};

const getDeliveryNoteById = async (req, res) => {
  try {
    const dn = await DeliveryNote.findById(req.params.id);
    res.json(dn);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createDeliveryNote,
  confirmDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,
};
