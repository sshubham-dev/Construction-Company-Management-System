const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    // ---------------------------------------------------------
    // Basic Item Details
    // ---------------------------------------------------------
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    itemType: {
      type: String,
      enum: ["Consumable", "AssetComponent"],
      default: "Consumable",
    },
    hsnCode: String,
    gstRate: { type: Number, default: 18 },

    // ---------------------------------------------------------
    // Pricing (purchase & mrp are user-entered)
    // ---------------------------------------------------------
    purchasePrice: { type: Number, default: 0 }, // user input
    mrp: { type: Number, default: 0 }, // user input

    surchargePercentage: {
      staffSalary: { type: Number, default: 0 },
      profit: { type: Number, default: 0 },
      expenses: { type: Number, default: 0 },
      investment: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
    },

    // Auto calculated sale price = purchasePrice + surcharge
    salePrice: { type: Number, default: 0 },

    // ---------------------------------------------------------
    // Multi Store Stock Levels
    // ---------------------------------------------------------
    stockByStore: [
      {
        storeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
          required: true,
        },
        openingStock: { type: Number, default: 0 },
        currentStock: { type: Number, default: 0 },
        reservedStock: { type: Number, default: 0 },
        lastUpdated: { type: Date, default: Date.now },
      },
    ],

    // ---------------------------------------------------------
    // Purchase History
    // ---------------------------------------------------------
    purchaseHistory: [
      {
        purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase_Order" },
        supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
        quantity: Number,
        unitPrice: Number,
        totalAmount: Number,
        date: { type: Date, default: Date.now },
      },
    ],



    // ---------------------------------------------------------
    // Sales History
    // ---------------------------------------------------------
    salesHistory: [
      {
        salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Sales_Order" },
        soldTo: { type: mongoose.Schema.Types.ObjectId, refPath: "soldToType" },
        soldToType: { type: String, enum: ["Site", "Client", "BusinessUnit", "Store"] },
        quantity: Number,
        saleRate: Number,
        totalAmount: Number,
        date: { type: Date, default: Date.now },
      },
    ],

    // ---------------------------------------------------------
    // Return History
    // ---------------------------------------------------------
    returnHistory: [
      {
        returnType: { type: String, enum: ["PurchaseReturn", "SalesReturn"] },
        referenceId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "returnTypeRef",
        },
        returnTypeRef: {
          type: String,
          enum: ["Purchase_Order", "Sales_Order"],
        },
        quantity: Number,
        reason: String,
        date: { type: Date, default: Date.now },
      },
    ],

    // ---------------------------------------------------------
    // Stock Movement Audit Trail
    // ---------------------------------------------------------
    movementLog: [
      {
        type: {
          type: String,
          enum: ["Purchase", "Sale", "Return", "Adjustment", "Transfer"],
          required: true,
        },
        storeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
        },
        quantity: Number,
        rate: Number,
        narration: String,
        date: { type: Date, default: Date.now },
      },
    ],

    // ---------------------------------------------------------
    // Status
    // ---------------------------------------------------------
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const stockGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      // required: true,
      // unique: true,
      trim: true,
    },
    unit: [
      {
        type: String,
      },
    ],
    item: [
      {
        name: String,
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stock",
        },
      },
    ],
    profit: {
      type: Number,
    },
  },
  { timestamps: true }
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

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
      // Ranchi Store, Patna Store, etc.
    },

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
          ref: "Stock",
          required: true,
        },

        systemQty: { type: Number, required: true }, // From ERP
        physicalQty: { type: Number, required: true }, // From audit

        difference: { type: Number, default: 0 }, // physical - system

        differenceType: {
          type: String,
          enum: ["Excess", "Shortage", "Match"],
          default: "Match",
        },

        remarks: String,
      },
    ],

    // ----------------------------
    // Audit Summary
    // ----------------------------
    totalItemsAudited: Number,
    totalShortageValue: Number,
    totalExcessValue: Number,

    // ----------------------------
    // Adjustment Workflow
    // ----------------------------
    adjustmentRequired: {
      type: Boolean,
      default: false,
    },

    adjustmentStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    adjustmentVoucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockAdjustment",
      // Optional: adjustment voucher if created
    },

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

    isFinalSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Increase stock for a store
 * session optional
 */
stockSchema.statics.increaseStockForStore = async function (
  itemId,
  storeId,
  qty,
  rate = 0,
  session = null
) {
  const StockItem = this;
  const item = await StockItem.findById(itemId).session(session);
  if (!item) throw new Error("Stock item not found");

  let rec = item.stockByStore.find(
    (s) => s.storeId?.toString() === storeId?.toString()
  );
  if (!rec) {
    rec = {
      storeId,
      openingStock: 0,
      currentStock: 0,
      reservedStock: 0,
      lastUpdated: new Date(),
    };
    item.stockByStore.push(rec);
  }

  rec.currentStock = (rec.currentStock || 0) + (qty || 0);
  rec.lastUpdated = new Date();

  item.purchaseHistory.push({
    purchaseOrderId: null,
    supplierId: null,
    quantity: qty,
    unitPrice: rate,
    totalAmount: qty * rate,
    date: new Date(),
  });

  item.latestPurchasePrice = rate || item.latestPurchasePrice;
  item.save({ session });
  return item;
};

/**
 * Decrease stock for a store
 */
stockSchema.statics.decreaseStockForStore = async function (
  itemId,
  storeId,
  qty,
  session = null
) {
  const StockItem = this;
  const item = await StockItem.findById(itemId).session(session);
  if (!item) throw new Error("Stock item not found");

  const rec = item.stockByStore.find(
    (s) => s.storeId?.toString() === storeId?.toString()
  );
  if (!rec) throw new Error("Stock not found in this store");
  if ((rec.currentStock || 0) < qty) throw new Error("Insufficient stock");

  rec.currentStock = (rec.currentStock || 0) - qty;
  rec.lastUpdated = new Date();

  item.movementLog.push({
    type: "OUT",
    businessUnitId: storeId,
    qty,
    rate: item.latestPurchasePrice || 0,
    reason: "Issue/ Sale",
    date: new Date(),
  });

  await item.save({ session });
  return item;
};

const Stock = mongoose.model("Stock", stockSchema);
const Stock_Audit = mongoose.model("Stock_Audit", stockAuditSchema);
const Stock_Group = mongoose.model("Stock_Group", stockGroupSchema);
module.exports = { Stock, Stock_Group, Stock_Audit };
