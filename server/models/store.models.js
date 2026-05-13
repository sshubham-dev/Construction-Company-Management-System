const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["WAREHOUSE", "SITE"],
      required: true,
      index: true,
    },

    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
      index: true,
    },

    costCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
      default: null,
    },

    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },

    storeHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    storeIncharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


const pricingPolicySchema = new mongoose.Schema(
  {
    /* ======================
     SCOPE
  ====================== */

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null, // null = applies to all items
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // fallback level
    },

    /* ======================
     PRICING METHOD
  ====================== */

    pricingType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED", "OVERRIDE"],
      default: "PERCENTAGE",
    },

    /* ======================
     COMPONENTS
  ====================== */

    transportPercent: {
      type: Number,
      default: 0,
    },

    handlingPercent: {
      type: Number,
      default: 0,
    },

    overheadPercent: {
      type: Number,
      default: 0,
    },

    profitPercent: {
      type: Number,
      default: 0,
    },

    /* ======================
     FIXED / OVERRIDE
  ====================== */

    fixedAmount: {
      type: Number,
      default: 0,
    },

    overridePrice: {
      type: Number,
      default: 0,
    },

    /* ======================
     PRIORITY (IMPORTANT)
  ====================== */

    priority: {
      type: Number,
      default: 1,
    },

    /* ======================
     STATUS
  ====================== */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    effectiveFrom: Date,
    effectiveTo: Date,

    /* ======================
     META
  ====================== */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);


const storeTransferRequestSchema = new mongoose.Schema(
  {
    transferNo: {
      type: String,
      required: true,
      unique: true,
    },

    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    toStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        rate: Number,
      },
    ],

    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED", "COMPLETED"],
      default: "DRAFT",
      index: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,
    rejectedReason: String,

    narration: String,
  },
  { timestamps: true }
);


const Store = mongoose.model("Store", storeSchema);
const Store_Transfer = mongoose.model(
  "Store_Transfer",
  storeTransferRequestSchema
);

module.exports = {
  Store,
  Store_Transfer,
};
