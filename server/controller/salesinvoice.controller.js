const Ledger = require("../models/ledger.models");
const SalesInvoice = require("../models/salesinvoice.models");
const Site = require("../models/site.models");
const { Stock } = require("../models/stock.models");
const { Store } = require("../models/store.models");

const applySalesInvoiceToLedgers = async (invoice, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;

  const siteLedger = await Ledger.findOne({
    referenceType: "Site",
    referenceId: invoice.site.id,
  });

  if (!siteLedger) {
    throw new Error("Site ledger not found");
  }

  // Debit Site (Receivable)
  siteLedger.currentBalance += multiplier * invoice.netAmount;
  await siteLedger.save();

  // Credit Sales Account
  const salesLedger = await Ledger.findOne({ name: "Sales Account" });
  if (salesLedger) {
    salesLedger.currentBalance -= multiplier * invoice.grossAmount;
    await salesLedger.save();
  }

  // Credit Output GST
  if (invoice.gstAmount > 0) {
    const gstLedger = await Ledger.findOne({ name: "Output GST" });
    if (gstLedger) {
      gstLedger.currentBalance -= multiplier * invoice.gstAmount;
      await gstLedger.save();
    }
  }
};

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

const postSalesInvoice = async (req, res) => {
  try {
    const invoice = await SalesInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Sales Invoice not found" });
    }

    if (invoice.status !== "Draft") {
      return res.status(400).json({
        error: "Only Draft invoice can be posted",
      });
    }

    await applySalesInvoiceToLedgers(invoice, "add");
    invoice.status = "Posted";
    await invoice.save();

    res.json({
      message: "Sales invoice posted successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelSalesInvoice = async (req, res) => {
  try {
    const invoice = await SalesInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Sales Invoice not found" });
    }

    if (invoice.status !== "Posted") {
      return res.status(400).json({
        error: "Only Posted invoice can be cancelled",
      });
    }

    await applySalesInvoiceToLedgers(invoice, "subtract");

    invoice.status = "Cancelled";
    await invoice.save();

    res.json({
      message: "Sales invoice cancelled",
      invoice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSalesInvoices = async (req, res) => {
  try {
    const invoices = await SalesInvoice.find().sort({ createdAt: -1 });
    if(invoices.length === 0){
      return res.status(404).json({ error: "No Sales Invoices found" });
    }
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/v1/sales-invoice/site/:siteId/returnable
const getReturnableSalesInvoices = async (req, res) => {
  const { siteId } = req.params;

  const invoices = await SalesInvoice.find({
    "site.id": siteId,
    status: "Posted",
  })
    .select("invoiceNo items")
    .sort({ createdAt: -1 });

  res.json(invoices);
};

const getSalesInvoiceById = async (req, res) => {
  try {
    const invoice = await SalesInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Sales Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const generateSalesInvoiceNo = async () => {
  const year = new Date().getFullYear();

  // Find last invoice of current year
  const lastInvoice = await SalesInvoice.findOne({
    salesInvoiceNo: new RegExp(`^SI-${year}-`),
  })
    .sort({ createdAt: -1 })
    .select("salesInvoiceNo")
    .lean();

  let nextNumber = 1;

  if (lastInvoice?.salesInvoiceNo) {
    const lastSeq = parseInt(lastInvoice.salesInvoiceNo.split("-").pop(), 10);

    if (!isNaN(lastSeq)) {
      nextNumber = lastSeq + 1;
    }
  }

  return `SI-${year}-${String(nextNumber).padStart(6, "0")}`;
};

const createSalesInvoiceFromDN = async (deliveryNote, userId) => {
  // 1. Prevent duplicate invoice
  const existing = await SalesInvoice.findOne({
    deliveryNoteId: deliveryNote._id,
  });
  if (existing) return existing;

  /* ======================
     FETCH LEDGERS
  ====================== */
  const site = await Site.findById(deliveryNote.site.id);
  const store = await Store.findById(deliveryNote.store.id);

  if (!site?.ledger || !store?.ledgerId) {
    throw new Error("Ledger not configured for site or store");
  }

  /* ======================
     BUILD ITEMS
  ====================== */
  const items = [];
  let grossAmount = 0;
  let gstAmount = 0;

  for (const dnItem of deliveryNote.items) {
    if (dnItem.acceptedQty <= 0) continue;

    // Fetch stock for rate & GST
    const stock = await Stock.findById(dnItem.itemId);
    if (!stock) {
      throw new Error(`Stock not found for ${dnItem.item}`);
    }

    const qty = Number(dnItem.acceptedQty);
    const rate = Number(stock.salePrice || 0);

    if (!rate || isNaN(rate)) {
      throw new Error(`Rate not configured for ${dnItem.item}`);
    }

    const amount = qty * rate;
    const gstRate = Number(stock.gstRate || 0);
    const gst = (amount * gstRate) / 100;
    const total = amount + gst;

    items.push({
      stockId: dnItem.itemId,
      item: dnItem.item,
      unit: dnItem.unit,
      deliveredQty:qty,
      rate,
      amount,
      gstRate,
      gstAmount: gst,
      totalAmount: total,
    });

    grossAmount += amount;
    gstAmount += gst;
  }

  if (items.length === 0) {
    throw new Error("No accepted items to invoice");
  }

  const netAmount = grossAmount + gstAmount;

  /* ======================
     CREATE INVOICE
  ====================== */
  const invoice = await SalesInvoice.create({
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
  });

  return invoice;
};

module.exports = {
  createSalesInvoice,
  postSalesInvoice,
  cancelSalesInvoice,
  getSalesInvoices,
  getSalesInvoiceById,
  createSalesInvoiceFromDN,
  getReturnableSalesInvoices,
};
