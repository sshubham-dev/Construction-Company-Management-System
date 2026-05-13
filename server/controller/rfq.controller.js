const { RFQ, Quotation } = require("../models/rfq.models");
const PurchaseRequest = require("../models/purchaserequest.models");
const { Item } = require("../models/stock.models");
const { Ledger } = require("../models/ledger.models");
const crypto = require("crypto");

/* =========================
   GENERATE RFQ NUMBER
========================= */
async function generateRFQNo() {
  const last = await RFQ.findOne().sort({ createdAt: -1 });

  const year = new Date().getFullYear();

  if (!last) return `RFQ-${year}-0001`;

  const lastNumber = parseInt(last.rfqNo.split("-")[2]) || 0;

  return `RFQ-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
}

/* =========================
   CREATE RFQ
========================= */
const createRFQ = async (req, res) => {
  try {
    const { purchaseRequestId, suppliers } = req.body;

    const pr = await PurchaseRequest.findById(purchaseRequestId);
    if (!pr) throw new Error("PR not found");

    if (!suppliers?.length) throw new Error("Suppliers required");

    /* VALIDATE SUPPLIERS */
    const supplierDocs = await Ledger.find({
      _id: { $in: suppliers },
    });

    if (supplierDocs.length !== suppliers.length) {
      throw new Error("Invalid suppliers");
    }

    const items = pr.items.map((i) => ({
      itemId: i.itemId,
      unit: i.unit,
      quantity: i.requestedQty,
    }));

    const supplierList = suppliers.map((supplierId) => ({
      supplierId,
      accessToken: crypto.randomBytes(16).toString("hex"),
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    }));

    const rfq = await RFQ.create({
      rfqNo: await generateRFQNo(),
      storeId: pr.store,
      purchaseRequestId,
      items,
      suppliers: supplierList,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: rfq });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   SEND RFQ
========================= */
const sendRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) throw new Error("RFQ not found");
    if (rfq.status !== "DRAFT") throw new Error("Already sent");

    rfq.status = "SENT";

    await rfq.save();

    res.json({ success: true, data: rfq });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   SUBMIT QUOTATION
========================= */
const submitQuotation = async (req, res) => {
  try {
    const { accessToken, items } = req.body;

    const rfq = await RFQ.findOne({
      "suppliers.accessToken": accessToken,
      status: "SENT",
    });

    if (!rfq) throw new Error("Invalid RFQ");

    const supplier = rfq.suppliers.find(
      (s) => s.accessToken === accessToken
    );

    if (!supplier) throw new Error("Supplier not found");

    if (supplier.expiresAt && supplier.expiresAt < new Date()) {
      throw new Error("RFQ expired");
    }

    /* STRICT VALIDATION */
    if (items.length !== rfq.items.length) {
      throw new Error("Incomplete quotation");
    }

    const processedItems = rfq.items.map((rfqItem) => {
      const input = items.find(
        (i) => i.itemId.toString() === rfqItem.itemId.toString()
      );

      if (!input) throw new Error("Missing item");

      const variance = rfqItem.lastPurchaseRate
        ? input.rate - rfqItem.lastPurchaseRate
        : 0;

      return {
        itemId: rfqItem.itemId,
        quantity: rfqItem.quantity,
        rate: input.rate,
        lastPurchaseRate: rfqItem.lastPurchaseRate,
        variance,
      };
    });

    let quotation;

    try {
      quotation = await Quotation.create({
        rfqId: rfq._id,
        supplierId: supplier.supplierId,
        accessToken,
        items: processedItems,
      });
    } catch (err) {
      if (err.code === 11000) {
        throw new Error("Quotation already submitted");
      }
      throw err;
    }

    res.status(201).json({ success: true, data: quotation });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   GET RFQs
========================= */
const getRFQs = async (req, res) => {
  const data = await RFQ.find()
    .populate("storeId purchaseRequestId suppliers.supplierId")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
};

/* =========================
   GET QUOTATIONS
========================= */
const getQuotationsByRFQ = async (req, res) => {
  const data = await Quotation.find({ rfqId: req.params.rfqId })
    .populate("supplierId")
    .lean();

  res.json({ success: true, data });
};

/* =========================
   COMPARE QUOTATIONS (L1)
========================= */
const compareQuotations = async (req, res) => {
  const quotations = await Quotation.find({ rfqId: req.params.rfqId });

  const sorted = quotations.sort((a, b) => a.totalAmount - b.totalAmount);

  res.json({
    success: true,
    best: sorted[0],
    all: sorted,
  });
};

/* =========================
   SELECT QUOTATION
========================= */
const selectQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) throw new Error("Quotation not found");

    const rfq = await RFQ.findById(quotation.rfqId);

    if (rfq.status !== "SENT") {
      throw new Error("RFQ closed");
    }

    await Quotation.updateMany(
      { rfqId: rfq._id, _id: { $ne: quotation._id } },
      { status: "REJECTED", isSelected: false }
    );

    quotation.status = "SELECTED";
    quotation.isSelected = true;
    await quotation.save();

    rfq.status = "CLOSED";
    await rfq.save();

    res.json({ success: true, data: quotation });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   CLOSE RFQ
========================= */
const closeRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) throw new Error("RFQ not found");

    rfq.status = "CLOSED";
    await rfq.save();

    res.json({ success: true });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createRFQ,
  sendRFQ,
  getRFQs,
  closeRFQ,
  submitQuotation,
  getQuotationsByRFQ,
  selectQuotation,
  compareQuotations,
};