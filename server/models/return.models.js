const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 0,
  },

  reason: {
    type: String,
    enum: ["EXCESS", "SCRAP", "DAMAGE", "TOOLS_RETURN", "SUPPLIER_RETURN"],
    required: true,
  },

  remarks: String,
});

const returnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    /* ======================
     MOVEMENT
  ====================== */

    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    toStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },

    /* ======================
     TYPE
  ====================== */

    type: {
      type: String,
      enum: ["SITE_RETURN", "PURCHASE_RETURN", "ADJUSTMENT"],
      required: true,
    },

    /* ======================
     ITEMS
  ====================== */

    items: [returnItemSchema],

    /* ======================
     LINK (OPTIONAL)
  ====================== */

    reference: {
      type: String, // DN, GRN, etc
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    /* ======================
     STATUS
  ====================== */

    status: {
      type: String,
      enum: ["DRAFT", "VERIFIED", "CANCELLED"],
      default: "DRAFT",
    },

    narration: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Return = mongoose.model("Return", returnSchema);
module.exports = Return;
