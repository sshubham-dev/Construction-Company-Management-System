const mongoose = require("mongoose");

/* =========================
   PR ITEM
========================= */
const prItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    unit: String,

    requestedQty: {
      type: Number,
      required: true,
      min: 0,
    },

    issuedQty: {
      type: Number,
      default: 0, // updated via DN
      min: 0,
    },
    remarks: String,
  },
  { timestamps: true },
);

/* =========================
   VALIDATION
========================= */
prItemSchema.pre("validate", function () {
  if (this.issuedQty > this.requestedQty) {
    return new Error("Issued qty cannot exceed requested qty");
  }
});

/* =========================
   MAIN PR SCHEMA
========================= */
const purchaseRequestSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC DETAILS
    ========================== */
    prNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    category: String,
    requirementFor: String,

    reqDate: Date,

    /* =========================
       SITE
    ========================== */
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },

    /* =========================
       STORE
    ========================== */
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    /* =========================
       ITEMS
    ========================== */
    items: [prItemSchema],

    /* =========================
       APPROVAL FLOW
    ========================== */
    inchargeApprove: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING",
        "APPROVED",
        "REJECTED",
        "PARTIAL",
        "COMPLETED",
      ],
      default: "DRAFT",
    },

    /* =========================
       DELIVERY (LINK ONLY)
    ========================== */
    deliveryNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryNote",
      },
    ],

    /* =========================
       BILLING LINK
    ========================== */
    salesInvoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesInvoice",
      },
    ],

    remarks: String,
  },
  { timestamps: true },
);

/* =========================
   VIRTUALS
========================= */
purchaseRequestSchema.virtual("deliveryStatusAuto").get(function () {
  const totalRequested = this.items.reduce((a, i) => a + i.requestedQty, 0);
  const totalIssued = this.items.reduce((a, i) => a + i.issuedQty, 0);

  if (totalIssued === 0) return "Pending";
  if (totalIssued < totalRequested) return "Partially Delivered";
  return "Delivered";
});

/* =========================
   MODEL
========================= */
const PurchaseRequest =
  mongoose.models.PurchaseRequest ||
  mongoose.model("PurchaseRequest", purchaseRequestSchema);

module.exports = PurchaseRequest;
