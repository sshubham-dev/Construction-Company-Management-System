const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  poItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // link to PO item
  },

  orderedQty: {
    type: Number,
    required: true,
  },

  receivedQty: {
    type: Number,
    required: true,
  },

  rejectedQty: {
    type: Number,
    default: 0,
  },

  rate: {
    type: Number,
    required: true, // from PO
  },

  amount: {
    type: Number,
    required: true,
  },

  remarks: String,
});

grnItemSchema.pre("validate", function (next) {
  const acceptedQty = this.receivedQty - (this.rejectedQty || 0);

  if (acceptedQty < 0) {
    return next(new Error("Invalid quantities"));
  }

  next();
});

const grnSchema = new mongoose.Schema(
  {
    /* ======================
     IDENTITY
  ====================== */

    grnNo: {
      type: String,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    /* ======================
     PO LINK (MANDATORY)
  ====================== */

    poId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
      index: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    /* ======================
     LOCATION
  ====================== */

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    /* ======================
     ITEMS
  ====================== */

    items: [grnItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    /* ======================
     STATUS
  ====================== */

    status: {
      type: String,
      enum: ["DRAFT", "RECEIVED", "VERIFIED", "POSTED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },

    /* ======================
     META
  ====================== */

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    narration: String,
  },
  { timestamps: true },
);

const GRN = mongoose.model("GRN", grnSchema);

module.exports = GRN;
