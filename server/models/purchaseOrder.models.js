const mongoose = require("mongoose");

/* =========================
   PO ITEM SCHEMA
========================= */
const poItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    unit: String,

    orderedQty: {
      type: Number,
      required: true,
      min: 0,
    },

    receivedQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    invoicedQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    description: String,
  },
  { timestamps: true },
);

/* =========================
   VALIDATION
========================= */
poItemSchema.pre("save", function () {
  if (this.receivedQty > this.requestedQty) {
    return new Error("Received qty cannot exceed requested qty");
  }

  if (this.invoicedQty > this.receivedQty) {
    return new Error("Invoiced qty cannot exceed received qty");
  }
});


const purchaseOrderSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC DETAILS
    ========================== */
    poNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },

    poDate: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* =========================
       LINKED REQUEST
    ========================== */
    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
    },

    /* =========================
       SUPPLIER
    ========================== */
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    /* =========================
       DELIVERY DESTINATION
    ========================== */
    deliveryFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    /* =========================
       ITEMS
    ========================== */
    items: [poItemSchema],

    /* =========================
       BILLING
    ========================== */
    purchaseInvoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseInvoice",
      },
    ],

    paymentLedger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },

    /* =========================
       RETURNS
    ========================== */
    purchaseReturns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Return",
      },
    ],

    status: {
      type: String,
      enum: [
        "DRAFT",
        "APPROVED",
        "ORDERED",
        "PARTIAL",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },

    remarks: String,
  },
  { timestamps: true },
);

/* =========================
   INDEXES
========================= */
purchaseOrderSchema.index({ "supplier.id": 1 });

/* =========================
   VIRTUALS
========================= */
purchaseOrderSchema.virtual("isFullyReceived").get(function () {
  return (
    this.items.length > 0 &&
    this.items.every((i) => i.receivedQty >= i.requestedQty)
  );
});

purchaseOrderSchema.virtual("isFullyInvoiced").get(function () {
  return (
    this.items.length > 0 &&
    this.items.every((i) => i.receivedQty > 0 && i.invoicedQty >= i.receivedQty)
  );
});

purchaseOrderSchema.virtual("deliveryStatusAuto").get(function () {
  const totalRequested = this.items.reduce((a, i) => a + i.requestedQty, 0);
  const totalReceived = this.items.reduce((a, i) => a + i.receivedQty, 0);

  if (totalReceived === 0) return "Pending";
  if (totalReceived < totalRequested) return "Partially Delivered";
  return "Delivered";
});

purchaseOrderSchema.virtual("paymentStatusAuto").get(function () {
  if (!this.totalPaid || this.totalPaid === 0) return "Pending";
  if (this.totalPaid < this.totalAfterTax) return "Partially Paid";
  return "Paid";
});

/* =========================
   MODEL EXPORT
========================= */
const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = PurchaseOrder;
