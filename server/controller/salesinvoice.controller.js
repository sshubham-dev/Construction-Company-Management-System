const mongoose = require("mongoose");

const Ledger = require("../models/ledger.models");
const SalesInvoice = require("../models/salesinvoice.models");
const Site = require("../models/site.models");
const { Stock } = require("../models/stock.models");
const { Store } = require("../models/store.models");



const createSalesInvoice = async (req, res) => {
  try {
    const invoice = await SalesInvoice.create({
      ...req.body,
      status: "Draft",
      totalDue: req.body.netAmount,
      createdBy: req.user._id,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


/* =====================================
   GENERATE INVOICE NUMBER
===================================== */
const generateSalesInvoiceNo = async () => {
  const year = new Date().getFullYear();

  const last = await SalesInvoice.findOne({
    salesInvoiceNo: new RegExp(`^SI-${year}-`),
  })
    .sort({ createdAt: -1 })
    .select("salesInvoiceNo")
    .lean();

  let next = 1;

  if (last?.salesInvoiceNo) {
    const lastSeq = parseInt(last.salesInvoiceNo.split("-").pop(), 10);
    if (!isNaN(lastSeq)) next = lastSeq + 1;
  }

  return `SI-${year}-${String(next).padStart(6, "0")}`;
};

/* =====================================
   LEDGER ENGINE
===================================== */
const applySalesInvoiceToLedgers = async (
  invoice,
  session,
  mode = "add"
) => {
  const multiplier = mode === "add" ? 1 : -1;

  const siteLedger = await Ledger.findById(
    invoice.siteLedgerId
  ).session(session);

  if (!siteLedger) throw new Error("Site ledger not found");

  // Debit Site (Receivable)
  siteLedger.currentBalance += multiplier * invoice.netAmount;
  await siteLedger.save({ session });

  // Credit Sales
  const salesLedger = await Ledger.findOne({
    name: "Sales Account",
  }).session(session);

  if (salesLedger) {
    salesLedger.currentBalance -= multiplier * invoice.grossAmount;
    await salesLedger.save({ session });
  }

  // Output GST
  if (invoice.gstAmount > 0) {
    const gstLedger = await Ledger.findOne({
      name: "Output GST",
    }).session(session);

    if (gstLedger) {
      gstLedger.currentBalance -= multiplier * invoice.gstAmount;
      await gstLedger.save({ session });
    }
  }
};

/* =====================================
   CREATE FROM DN (STRICT)
===================================== */
const createSalesInvoiceFromDN = async (
  deliveryNote,
  userId,
  session
) => {
  const existing = await SalesInvoice.findOne({
    deliveryNoteId: deliveryNote._id,
  }).session(session);

  if (existing) return existing;

  const site = await Site.findById(deliveryNote.site.id).session(session);
  const store = await Store.findById(deliveryNote.store.id).session(session);

  if (!site?.ledger || !store?.ledgerId) {
    throw new Error("Ledger not configured");
  }

  const stockIds = deliveryNote.items.map(i => i.itemId);

  const stocks = await Stock.find({
    _id: { $in: stockIds },
  }).lean();

  const stockMap = new Map(
    stocks.map(s => [s._id.toString(), s])
  );

  let grossAmount = 0;
  let gstAmount = 0;
  const items = [];

  for (const dnItem of deliveryNote.items) {
    if (dnItem.acceptedQty <= 0) continue;

    const stock = stockMap.get(dnItem.itemId.toString());
    if (!stock) throw new Error("Stock not found");

    const qty = dnItem.acceptedQty;
    const rate = stock.salePrice;

    if (!rate) throw new Error(`Rate missing for ${dnItem.item}`);

    const amount = qty * rate;
    const gst = (amount * (stock.gstRate || 0)) / 100;

    items.push({
      stockId: dnItem.itemId,
      dnItemId: dnItem._id,
      item: dnItem.item,
      unit: dnItem.unit,
      deliveredQty: qty,
      rate,
      amount,
      gstRate: stock.gstRate || 0,
      gstAmount: gst,
      totalAmount: amount + gst,
    });

    grossAmount += amount;
    gstAmount += gst;
  }

  if (!items.length) throw new Error("No items to invoice");

  const netAmount = grossAmount + gstAmount;

  const invoice = await SalesInvoice.create(
    [
      {
        salesInvoiceNo: await generateSalesInvoiceNo(),

        deliveryNoteId: deliveryNote._id,
        purchaseRequestId: deliveryNote.purchaseRequestId,

        site: deliveryNote.site,
        store: deliveryNote.store,

        siteLedgerId: site.ledger,
        storeLedgerId: store.ledgerId,

        items,

        grossAmount,
        gstAmount,
        netAmount,

        totalPaid: 0,
        totalDue: netAmount,

        status: "Draft",
        createdBy: userId,
        source: "DeliveryNote",
      },
    ],
    { session }
  );

  return invoice[0];
};

/* =====================================
   POST INVOICE
===================================== */
const postSalesInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await SalesInvoice.findById(
      req.params.id
    ).session(session);

    if (!invoice) throw new Error("Invoice not found");

    if (invoice.status !== "Draft") {
      throw new Error("Only Draft invoice can be posted");
    }

    await applySalesInvoiceToLedgers(invoice, session, "add");

    invoice.status = "Posted";
    invoice.postedAt = new Date();

    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Sales invoice posted successfully",
      invoice,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: error.message });
  }
};

/* =====================================
   CANCEL INVOICE
===================================== */
const cancelSalesInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await SalesInvoice.findById(
      req.params.id
    ).session(session);

    if (!invoice) throw new Error("Invoice not found");

    if (invoice.status !== "Posted") {
      throw new Error("Only Posted invoice can cancel");
    }

    await applySalesInvoiceToLedgers(invoice, session, "subtract");

    invoice.status = "Cancelled";

    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Sales invoice cancelled",
      invoice,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: error.message });
  }
};

/* =====================================
   GET
===================================== */
const getSalesInvoices = async (req, res) => {
  const invoices = await SalesInvoice.find().sort({ createdAt: -1 });
  res.json(invoices);
};

const getSalesInvoiceById = async (req, res) => {
  const invoice = await SalesInvoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Not found" });
  res.json(invoice);
};

/* =====================================
   RETURNABLE
===================================== */
const getReturnableSalesInvoices = async (req, res) => {
  const invoices = await SalesInvoice.find({
    "site.id": req.params.siteId,
    status: "Posted",
  }).select("salesInvoiceNo items");

  res.json(invoices);
};

module.exports = {
  createSalesInvoiceFromDN,
  postSalesInvoice,
  cancelSalesInvoice,
  getSalesInvoices,
  getSalesInvoiceById,
  getReturnableSalesInvoices,
  createSalesInvoice
};