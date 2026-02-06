const Ledger = require("../models/ledger.models");
const PurchaseInvoice = require("../models/purchaseinvoice.models");

const applyPurchaseInvoiceToLedgers = async (invoice, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;

  const supplierLedger = await Ledger.findById(invoice.supplier.id);
  if (!supplierLedger) throw new Error("Supplier ledger not found");

  // Supplier payable
  supplierLedger.currentBalance -= multiplier * invoice.netAmount;
  await supplierLedger.save();

  // Stock / Expense (simplified version)
  const purchaseLedger = await Ledger.findOne({ name: "Purchase Account" });
  if (purchaseLedger) {
    purchaseLedger.currentBalance += multiplier * invoice.grossAmount;
    await purchaseLedger.save();
  }

  if (invoice.gstAmount > 0) {
    const gstLedger = await Ledger.findOne({ name: "Input GST" });
    if (gstLedger) {
      gstLedger.currentBalance += multiplier * invoice.gstAmount;
      await gstLedger.save();
    }
  }
};

const createPurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.create({
      ...req.body,
      status: "Draft",
      createdBy: req.user._id,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const postPurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Not found" });

    if (invoice.status !== "Draft") {
      return res.status(400).json({
        error: "Only Draft invoice can be posted",
      });
    }

    await applyPurchaseInvoiceToLedgers(invoice, "add");

    invoice.status = "Posted";
    invoice.postedAt = new Date();
    await invoice.save();

    res.json({ message: "Purchase invoice posted", invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelPurchaseInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Not found" });

    if (invoice.status !== "Posted") {
      return res.status(400).json({
        error: "Only Posted invoice can be cancelled",
      });
    }

    await applyPurchaseInvoiceToLedgers(invoice, "subtract");

    invoice.status = "Cancelled";
    await invoice.save();

    res.json({ message: "Purchase invoice cancelled", invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPurchaseInvoices = async (req, res) => {
    try {
        const invoices = await PurchaseInvoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getPurchaseInvoiceById = async (req, res) => {
    try {
        const invoice = await PurchaseInvoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ error: 'Purchase Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const buildPurchaseInvoiceItems = (grn) => {
  return grn.items
    .filter(i => i.acceptedQty > 0)
    .map(i => {
      const amount = i.acceptedQty * i.rate;
      const gstAmount = (amount * (i.gstRate || 0)) / 100;

      return {
        stockId: i.stockId,
        item: i.item,
        unit: i.unit,
        receivedQty: i.acceptedQty,
        rate: i.rate,
        amount,
        gstRate: i.gstRate || 0,
        gstAmount,
        totalAmount: amount + gstAmount,
      };
    });
};

const createPurchaseInvoiceFromGRN = async (grn, userId) => {
  const existing = await PurchaseInvoice.findOne({ grnId: grn._id });
  if (existing) return existing;

  const items = buildPurchaseInvoiceItems(grn);

  const grossAmount = items.reduce((s, i) => s + i.amount, 0);
  const gstAmount = items.reduce((s, i) => s + i.gstAmount, 0);
  const netAmount = grossAmount + gstAmount;

  const invoice = await PurchaseInvoice.create({
    grnId: grn._id,
    purchaseOrderId: grn.purchaseOrderId,
    supplier: grn.supplier,
    supplierLedgerId: grn.supplierLedgerId,
    store: grn.store,
    items,
    grossAmount,
    gstAmount,
    netAmount,
    totalDue: netAmount,
    createdBy: userId,
  });

  return invoice;
};

module.exports = {
  createPurchaseInvoice,
  postPurchaseInvoice,
  cancelPurchaseInvoice,
  getPurchaseInvoices,
  getPurchaseInvoiceById,
  createPurchaseInvoiceFromGRN,
};