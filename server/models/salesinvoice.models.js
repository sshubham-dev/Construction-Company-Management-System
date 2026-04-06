const mongoose = require("mongoose");

/* =========================
   SALES INVOICE ITEM
========================= */
const salesInvoiceItemSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },

  // dnItemId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  // },

  item: String,
  unit: String,

  acceptedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  sellingRate: {
    type: Number,
    required: true,
  },

  costRate: Number, // optional (for profit tracking)

  amount: Number,

  gstRate: {
    type: Number,
    default: 0,
  },

  gstAmount: Number,
  totalAmount: Number,
});
salesInvoiceItemSchema.pre("save", function () {
  if (this.acceptedQty <= 0) {
    return new Error("Invoice qty must be greater than 0");
  }

});

/* =========================
   SALES INVOICE
========================= */
const salesInvoiceSchema = new mongoose.Schema(
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
       DN LINK (MANDATORY)
    ========================== */
    deliveryNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryNote",
      required: true,
      unique: true, // 1 DN → 1 Invoice
    },

    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
    },

    /* =========================
       CUSTOMER (SITE / CLIENT)
    ========================== */
    customerType: {
      type: String,
      enum: ["Site", "Client"],
      required: true,
    },

    customer: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
    },

    customerLedgerId: {
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
    items: [salesInvoiceItemSchema],

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

    remarks: String,
  },
  { timestamps: true }
);

salesInvoiceSchema.pre("save", function () {
  let gross = 0;
  let gst = 0;

  const round = (n) => Math.round(n * 100) / 100;

  this.items.forEach((item) => {
    const amount = round((item.acceptedQty || 0) * (item.sellingRate || 0));
    item.amount = amount;

    gross += amount;

    const tax = item.gstRate
      ? round((amount * item.gstRate) / 100)
      : 0;

    item.gstAmount = tax;
    item.totalAmount = round(amount + tax);

    gst += tax;
  });

  this.grossAmount = round(gross);
  this.gstAmount = round(gst);
  this.netAmount = round(gross + gst);

  this.totalDue = round(
    Math.max(0, this.netAmount - (this.totalPaid || 0))
  );
});


const SalesInvoice = mongoose.model("SalesInvoice", salesInvoiceSchema);
module.exports = SalesInvoice;
