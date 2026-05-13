const mongoose = require("mongoose");

const stockCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock_Category",
      default: null,
    },

    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// stockCategorySchema.index({ name: 1, parentId: 1 }, { unique: true });

const stockGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    code: {
      type: String,
    },

    // === BEHAVIOR FLAGS ===

    affectsInventory: {
      type: Boolean,
      default: true,
    },

    isConsumable: {
      type: Boolean,
      default: false,
    },

    isAsset: {
      type: Boolean,
      default: false,
    },

    // // === ACCOUNTING DEFAULTS ===
    accounting: {
      inventoryLedgerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        default: null,
      },

      purchaseLedgerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        default: null,
      },

      salesLedgerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        default: null,
      },

      consumptionLedgerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        default: null,
      },

      scrapLedgerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        default: null,
      },
    },

    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const stockItemSchema = new mongoose.Schema(
  {
    /* ======================
       BASIC INFO
    ====================== */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      // required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    /* ======================
       CLASSIFICATION
    ====================== */
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock_Category",
      required: true,
      index: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock_Group",
      required: true,
      index: true,
    },

    /* ======================
       UNIT & TYPE
    ====================== */
    unit: {
      type: String,
      required: true, // "bag", "kg", "nos"
    },

    itemType: {
      type: String,
      enum: ["INVENTORY", "SERVICE", "ASSET", "MATERIAL"],
      default: "INVENTORY",
    },

    procurementMode: {
      type: String,
      enum: [
        "STORE_STOCK",
        "DIRECT_PROCUREMENT",
        "BOTH",
      ],
      default: "STORE_STOCK",
    },

    /* ======================
       DEFAULTS (NOT DYNAMIC)
    ====================== */
    defaultPurchaseRate: {
      type: Number,
      default: 0,
    },

    /* ======================
       OPTIONAL METADATA
    ====================== */
    brand: String, // Ultratech, ACC, etc.
    specification: String, // 50kg bag, grade, etc.
    description: String,

    /* ======================
       STATUS
    ====================== */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const stockSchema = new mongoose.Schema(
  {
    /* ======================
       IDENTITY
    ====================== */

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    /* ======================
       QUANTITY (BASE UNIT ONLY)
    ====================== */

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    reservedQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ======================
       VALUATION
    ====================== */

    avgRate: {
      type: Number,
      default: 0, // per base unit
    },

    stockValue: {
      type: Number,
      default: 0,
    },

    lastPurchaseRate: {
      type: Number,
      default: 0,
    },

    /* ======================
       META
    ====================== */

    lastTransactionAt: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// unique index
stockSchema.index({ itemId: 1, storeId: 1 }, { unique: true });

const stockTransactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },

    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    toStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    rate: {
      type: Number,
      required: true, // cost rate
    },

    type: {
      type: String,
      enum: ["IN", "OUT", "TRANSFER"],
      required: true,
      index: true,
    },

    balanceAfter: {
      type: Number,
    },

    source: {
      type: String,
      enum: ["GRN", "DN", "RETURN", "ADJUSTMENT", "SALES"],
    },

    referenceId: mongoose.Schema.Types.ObjectId,

    date: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);
stockTransactionSchema.index(
  { referenceId: 1, source: 1 },
  { unique: true, sparse: true }
);


const stockAuditSchema = new mongoose.Schema(
  {
    // ----------------------------
    // Audit Identification
    // ----------------------------
    auditNo: {
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
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
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

    status: {
      type: String,
      enum: ["DRAFT", "APPROVED", "COUNTED", "ADJUSTED", "CANCELLED"],
      default: "DRAFT",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    narration: String,
  },
  { timestamps: true },
);


const Stock_Category = mongoose.model("Stock_Category", stockCategorySchema);
const Stock_Group = mongoose.model("Stock_Group", stockGroupSchema);
const Item = mongoose.model("Item", stockItemSchema);
const Stock = mongoose.model("Stock", stockSchema);
const Stock_Transaction = mongoose.model("Stock_Transaction", stockTransactionSchema);
const Stock_Audit = mongoose.model("Stock_Audit", stockAuditSchema);

module.exports = {
  Stock,
  Item,
  Stock_Group,
  Stock_Audit,
  Stock_Transaction,
  Stock_Category,
};
