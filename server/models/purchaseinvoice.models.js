const mongoose = require("mongoose");

const purchaseInvoiceItemSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  item: String,
  unit: String,

  receivedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  rate: {
    type: Number,
    required: true,
  },

  amount: Number,

  gstRate: {
    type: Number,
    default: 0,
  },

  gstAmount: Number,
  totalAmount: Number,
});
purchaseInvoiceItemSchema.pre("save", function () {
  if (this.receivedQty <= 0) {
    return new Error("Invoice qty must be greater than 0");
  }
});

const purchaseInvoiceSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      unique: true,
      index: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    /* =========================
       GRN LINK (MANDATORY)
    ========================== */
    grnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GRN",
      required: true,
      unique: true, // 1 GRN → 1 Invoice
    },

    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },

    /* =========================
       SUPPLIER (SNAPSHOT)
    ========================== */
    supplier: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
      },
      name: String,
    },

    supplierLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    /* =========================
       STORE
    ========================== */
    store: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
      name: String,
    },

    /* =========================
       ITEMS
    ========================== */
    items: [purchaseInvoiceItemSchema],

    /* =========================
       FINANCIAL
    ========================== */
    grossAmount: Number,
    gstAmount: Number,
    netAmount: Number,

    totalPaid: {
      type: Number,
      default: 0,
    },

    totalDue: {
      type: Number,
      required: true,
    },

    /* =========================
       STATUS
    ========================== */
    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid"],
      default: "Pending",
    },

    /* =========================
       AUDIT
    ========================== */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

purchaseInvoiceSchema.pre("save", function () {
  let gross = 0;
  let gst = 0;

  const round = (n) => Math.round(n * 100) / 100;

  this.items.forEach((item) => {
    const amount = round((item.receivedQty || 0) * (item.rate || 0));
    item.amount = amount;

    gross += amount;

    const tax = item.gstRate ? round((amount * item.gstRate) / 100) : 0;

    item.gstAmount = tax;
    item.totalAmount = round(amount + tax);

    gst += tax;
  });

  this.grossAmount = round(gross);
  this.gstAmount = round(gst);
  this.netAmount = round(gross + gst);

  this.totalDue = round(Math.max(0, this.netAmount - (this.totalPaid || 0)));
});

const PurchaseInvoice = mongoose.model(
  "PurchaseInvoice",
  purchaseInvoiceSchema,
);
module.exports = PurchaseInvoice;
