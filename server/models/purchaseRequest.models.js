const mongoose = require("mongoose");

/* =========================
   PR ITEM
========================= */
const prItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  unit: { type: String, required: true },

  requestedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  issuedQty: {
    type: Number,
    default: 0,
    min: 0,
  },

  pendingQty: {
    type: Number,
    default: 0,
  },

  remarks: String,
});

/* =========================
   VALIDATION
========================= */
prItemSchema.pre("validate", function () {
  if (this.issuedQty > this.requestedQty) {
    return new Error("Issued qty cannot exceed requested qty");
  }
});

prItemSchema.pre("save", function () {
  this.pendingQty = this.requestedQty - this.issuedQty;
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

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock_Category",
    },

    requirementFor: String,
    reqDate: Date,

    /* =========================
       SITE
    ========================== */
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
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
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "PARTIAL",
        "DELIVERED",
      ],
      default: "REQUESTED",
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

    narration: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

/* =========================
   VIRTUALS
========================= */
purchaseRequestSchema.virtual("deliveryStatus").get(function () {
  const totalRequested = this.items.reduce((a, i) => a + i.requestedQty, 0);
  const totalIssued = this.items.reduce((a, i) => a + i.issuedQty, 0);

  if (totalIssued === 0) return "PENDING";
  if (totalIssued < totalRequested) return "PARTIAL";
  return "DELIVERED";
});

/* =========================
   MODEL
========================= */
const PurchaseRequest =
  mongoose.models.PurchaseRequest ||
  mongoose.model("PurchaseRequest", purchaseRequestSchema);

module.exports = PurchaseRequest;
