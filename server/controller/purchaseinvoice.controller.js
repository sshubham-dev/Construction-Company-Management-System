const mongoose = require("mongoose")
const GRN = require("../models/grn.models");
const Ledger = require("../models/ledger.models");
const PurchaseInvoice = require("../models/purchaseinvoice.models");

const applyPurchaseInvoiceToLedgers = async (
  invoice,
  session,
  mode = "add"
) => {
  const multiplier = mode === "add" ? 1 : -1;

  const supplierLedger = await Ledger.findById(
    invoice.supplierLedgerId
  ).session(session);

  if (!supplierLedger) throw new Error("Supplier ledger not found");

  /* =========================
     SUPPLIER PAYABLE
  ========================== */
  supplierLedger.currentBalance -= multiplier * invoice.netAmount;
  await supplierLedger.save({ session });

  /* =========================
     PURCHASE ACCOUNT
  ========================== */
  const purchaseLedger = await Ledger.findOne({
    name: "Purchase Account",
  }).session(session);

  if (purchaseLedger) {
    purchaseLedger.currentBalance += multiplier * invoice.grossAmount;
    await purchaseLedger.save({ session });
  }

  /* =========================
     INPUT GST
  ========================== */
  if (invoice.gstAmount > 0) {
    const gstLedger = await Ledger.findOne({
      name: "Input GST",
    }).session(session);

    if (gstLedger) {
      gstLedger.currentBalance += multiplier * invoice.gstAmount;
      await gstLedger.save({ session });
    }
  }
};

const createPurchaseInvoice = async (req, res) => {
  try {
    const { grnId } = req.body;
    const userId = req.user._id;

    if (!grnId) {
      throw new Error("GRN is required");
    }

    const grn = await GRN.findById(grnId);

    if (!grn) throw new Error("GRN not found");

    if (grn.status !== "Posted") {
      throw new Error("Only posted GRN can generate invoice");
    }

    /* =========================
       PREVENT DUPLICATE
    ========================== */
    const existing = await PurchaseInvoice.findOne({
      grnId: grn._id,
    });

    if (existing) {
      return res.json({
        message: "Invoice already exists",
        invoice: existing,
      });
    }

    /* =========================
       BUILD ITEMS
    ========================== */
    const items = grn.items
      .filter((i) => i.acceptedQty > 0)
      .map((i) => {
        const amount = i.acceptedQty * i.rate;
        const gstAmount = (amount * (i.gstRate || 0)) / 100;

        return {
          stockId: i.stockId,
          grnItemId: i._id, // 🔥 IMPORTANT
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

    if (!items.length) {
      throw new Error("No valid items in GRN");
    }

    /* =========================
       TOTALS
    ========================== */
    const grossAmount = items.reduce((s, i) => s + i.amount, 0);
    const gstAmount = items.reduce((s, i) => s + i.gstAmount, 0);
    const netAmount = grossAmount + gstAmount;

    /* =========================
       CREATE INVOICE
    ========================== */
    const invoice = await PurchaseInvoice.create({
      grnId: grn._id,
      purchaseOrderId: grn.purchaseOrderId,

      supplier: {
        id: grn.supplierId,
        name: "", // optional snapshot
      },

      supplierLedgerId: grn.supplierLedgerId,

      store: {
        id: grn.storeId,
      },

      items,

      grossAmount,
      gstAmount,
      netAmount,

      totalPaid: 0,
      totalDue: netAmount,

      status: "Draft",
      createdBy: userId,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const postPurchaseInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await PurchaseInvoice.findById(
      req.params.id
    ).session(session);

    if (!invoice) throw new Error("Invoice not found");

    if (invoice.status !== "Draft") {
      throw new Error("Only Draft invoice can be posted");
    }

    /* =========================
       APPLY LEDGER
    ========================== */
    await applyPurchaseInvoiceToLedgers(invoice, session, "add");

    invoice.status = "Posted";
    invoice.postedAt = new Date();

    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Purchase invoice posted",
      invoice,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: error.message });
  }
};

const cancelPurchaseInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await PurchaseInvoice.findById(
      req.params.id
    ).session(session);

    if (!invoice) throw new Error("Invoice not found");

    if (invoice.status !== "Posted") {
      throw new Error("Only Posted invoice can be cancelled");
    }

    /* =========================
       REVERSE LEDGER
    ========================== */
    await applyPurchaseInvoiceToLedgers(invoice, session, "subtract");

    invoice.status = "Cancelled";

    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Purchase invoice cancelled",
      invoice,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: error.message });
  }
};

const getPurchaseInvoices = async (req, res) => {
  const invoices = await PurchaseInvoice.find().sort({ createdAt: -1 });
  res.json(invoices);
};

const getPurchaseInvoiceById = async (req, res) => {
  const invoice = await PurchaseInvoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Not found" });
  res.json(invoice);
};

const createPurchaseInvoiceFromGRN = async (
  grn,
  userId,
  session
) => {
  const existing = await PurchaseInvoice.findOne({
    grnId: grn._id,
  }).session(session);

  if (existing) return existing;

  const items = grn.items
    .filter((i) => i.acceptedQty > 0)
    .map((i) => {
      const amount = i.acceptedQty * i.rate;
      const gstAmount = (amount * (i.gstRate || 0)) / 100;

      return {
        stockId: i.stockId,
        grnItemId: i._id, // 🔥 IMPORTANT
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

  const grossAmount = items.reduce((s, i) => s + i.amount, 0);
  const gstAmount = items.reduce((s, i) => s + i.gstAmount, 0);
  const netAmount = grossAmount + gstAmount;

  const invoice = await PurchaseInvoice.create(
    [
      {
        grnId: grn._id,
        purchaseOrderId: grn.purchaseOrderId,

        supplier: {
          id: grn.supplierId,
          name: "", // snapshot optional
        },

        supplierLedgerId: grn.supplierLedgerId,
        store: { id: grn.storeId },

        items,
        grossAmount,
        gstAmount,
        netAmount,

        totalPaid: 0,
        totalDue: netAmount,

        status: "Draft",
        createdBy: userId,
      },
    ],
    { session }
  );

  return invoice[0];
};

module.exports = {
  createPurchaseInvoice,
  postPurchaseInvoice,
  cancelPurchaseInvoice,
  getPurchaseInvoices,
  getPurchaseInvoiceById,
  createPurchaseInvoiceFromGRN,
};