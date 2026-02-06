const mongoose = require("mongoose");

/* =========================
   SALES INVOICE ITEM
========================= */
const salesInvoiceItemSchema = new mongoose.Schema(
  {
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    item: String, // snapshot name
    unit: String,

    /* ======================
       QUANTITY
    ====================== */
    deliveredQty: {
      type: Number,
      required: true,
    },

    /* ======================
       PRICING
    ====================== */
    rate: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true, // acceptedQty * rate
    },

    gstRate: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true, // amount + gst
    },
  },
  { timestamps: true }
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
      unique: true,
      index: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    /* ======================
       SOURCE DOCUMENT
    ====================== */
    deliveryNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryNote",
      required: true,
      unique: true, // 1 DN → 1 Invoice
    },

    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
    },

    /* ======================
       SELLER (STORE)
    ====================== */
    store: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
      },
      name: String,
    },

    storeLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    /* ======================
       BUYER (SITE)
    ====================== */
    site: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
        required: true,
      },
      name: String,
    },

    siteLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    /* ======================
       ITEMS
    ====================== */
    items: [salesInvoiceItemSchema],

    /* ======================
       TOTALS
    ====================== */
    grossAmount: {
      type: Number,
      required: true,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    netAmount: {
      type: Number,
      required: true,
    },

    /* ======================
       PAYMENT
    ====================== */
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid"],
      default: "Pending",
    },

    totalPaid: {
      type: Number,
      default: 0,
    },

    totalDue: {
      type: Number,
      required: true,
    },

    /* ======================
       ACCOUNTING
    ====================== */
    ledgerEntries: [
      {
        ledgerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ledger",
        },
        type: {
          type: String,
          enum: ["Debit", "Credit"],
        },
        amount: Number,
      },
    ],

    /* ======================
       SYSTEM
    ====================== */
    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: String,
  },
  { timestamps: true }
);

salesInvoiceSchema.pre("save", async function (next) {
  try {
    if (this.invoiceNo) return next();

    const invoiceDate = this.invoiceDate || new Date();
    const year = invoiceDate.getFullYear();
    const fy =
      invoiceDate.getMonth() < 3
        ? `${year - 1}-${year.toString().slice(-2)}`
        : `${year}-${(year + 1).toString().slice(-2)}`;

    const storeCode =
      this.store?.name
        ?.replace(/\s+/g, "")
        .toUpperCase()
        .slice(0, 8) || "STORE";

    const lastInvoice = await this.constructor
      .findOne({
        "store.id": this.store.id,
        invoiceNo: { $regex: `^SI/${storeCode}/${fy}/` },
      })
      .sort({ createdAt: -1 })
      .lean();

    let nextSeq = 1;

    if (lastInvoice?.invoiceNo) {
      const parts = lastInvoice.invoiceNo.split("/");
      const lastSeq = parseInt(parts[3], 10);
      if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    this.invoiceNo = `SI/${storeCode}/${fy}/${String(nextSeq).padStart(4, "0")}`;

    next();
  } catch (err) {
    next(err);
  }
});


const SalesInvoice = mongoose.model("SalesInvoice", salesInvoiceSchema);
module.exports = SalesInvoice;
