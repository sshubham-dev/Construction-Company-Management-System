const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },

    quantity: { type: Number, default: 0 },

    avgRate: { type: Number, default: 0 },

    reservedQuantity: { type: Number, default: 0 },

    lastPurchaseRate: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// unique index
stockSchema.index({ storeId: 1, itemId: 1 }, { unique: true });
// auto calculation
stockSchema.pre("save", function () {
  this.stockValue = (this.quantity || 0) * (this.averageRate || 0);
});

const stockItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },

    category: { type: String, required: true, index: true },

    unit: { type: String, required: true },

    itemType: {
      type: String,
      default: "CONSUMABLE",
      index: true,
    },

    code: { type: String, unique: true, index: true },
    gstRate: { type: Number, default: 0 },

    purchasePrice: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const stockGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    code: { type: String, trim: true },

    unit: [String],

    defaultMargin: { type: Number, default: 0 },

    /* =========================
       STATUS
    ========================== */

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const stockAuditSchema = new mongoose.Schema(
  {
    // ----------------------------
    // Audit Identification
    // ----------------------------
    auditCode: {
      type: String,
      unique: true,
      trim: true,
      // Example: RN-ST-2025-01 (Ranchi Store Jan 2025)
    },

    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },

    auditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // person who conducted the audit
    },

    auditDate: {
      type: Date,
      default: Date.now,
    },

    // ----------------------------
    // Items Audited
    // ----------------------------
    items: [
      {
        stockId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stock",
          required: true,
        },

        systemQty: { type: Number, required: true }, // From ERP
        physicalQty: { type: Number, required: true }, // From audit

        difference: { type: Number, default: 0 }, // physical - system

        differenceType: {
          type: String,
          enum: ["EXCESS", "SHORTAGE", "MATCH"],
        },

        rate: Number,
        value: Number,

        remarks: String,
      },
    ],

    // ----------------------------
    // Attachments (photos, PDFs)
    // ----------------------------
    attachments: [
      {
        fileUrl: String,
        fileType: String, // pdf / jpg / png
      },
    ],

    // ----------------------------
    // Notes
    // ----------------------------
    comments: String,

    status: {
      type: String,
      enum: ["DRAFT", "APPROVED", "POSTED"],
      default: "DRAFT",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const stockTransferSchema = new mongoose.Schema(
  {
    date: Date,
    fromStoreId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    toStoreId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },

    items: [
      {
        stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
        quantity: Number,
        rate: Number,
      },
    ],

    status: {
      type: String,
      enum: ["DRAFT", "POSTED"],
      default: "DRAFT",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    narration: String,
  },
  { timestamps: true },
);

const Stock = mongoose.model("Stock", stockSchema);
const Stock_Group = mongoose.model("Stock_Group", stockGroupSchema);
const Item = mongoose.model("Item", stockItemSchema);
const Stock_Audit = mongoose.model("Stock_Audit", stockAuditSchema);
const Stock_Transfer = mongoose.model("Stock_Transfer", stockTransferSchema);
module.exports = { Stock, Item, Stock_Group, Stock_Audit, Stock_Transfer };
