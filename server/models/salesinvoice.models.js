const mongoose = require("mongoose");

/* =========================
   SALES INVOICE ITEM
========================= */
const salesInvoiceItemSchema = new mongoose.Schema(
  {
    /* ======================
     ITEM (ONLY FOR MATERIAL)
  ====================== */

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },

    description: {
      type: String,
      required: true,
    },

    /* ======================
     QUANTITY & RATE
  ====================== */

    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },

    unit: String,

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      required: true,
    },

    /* ======================
     TAX
  ====================== */

    gstRate: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    /* ======================
     META
  ====================== */

    remarks: String,
  },
  { _id: true },
);

/* =========================
   SALES INVOICE
========================= */
const salesInvoiceSchema = new mongoose.Schema(
  {
    /* ======================
     IDENTITY
  ====================== */

    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },

    dueDate: Date,

    /* ======================
     PARTY
  ====================== */

    customerLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
      index: true,
    },

    /* ======================
     LOCATION / CONTEXT
  ====================== */
    costCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    /* ======================
     ITEMS
  ====================== */

    items: [salesInvoiceItemSchema],

    /* ======================
     TOTALS
  ====================== */

    subTotal: {
      type: Number,
      required: true,
    },

    totalTax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    netAmount: {
      type: Number,
      required: true,
    },

    /* ======================
     LINKING
  ====================== */

    salesVoucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesVoucher",
    },

    /* ======================
     STATUS
  ====================== */

    status: {
      type: String,
      enum: ["DRAFT", "POSTED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIALLY PAID", "PAID"],
      default: "PENDING",
    },

    /* ======================
     META
  ====================== */

    narration: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const SalesInvoice = mongoose.model("SalesInvoice", salesInvoiceSchema);
module.exports = SalesInvoice;
