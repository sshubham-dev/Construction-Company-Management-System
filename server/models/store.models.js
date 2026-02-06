const mongoose = require("mongoose");
const { syncLedger } = require("../utils/ledgerSync");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, index: true },

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
      index: true,
    },

    address: {
      line1: String,
      line2: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
    },

    managesConsumables: { type: Boolean, default: true },
    managesAssets: { type: Boolean, default: true },
    allowDirectSalesToClients: { type: Boolean, default: true },
    allowInternalSalesToSites: { type: Boolean, default: true },
    allowOfficeItemIssue: { type: Boolean, default: true },

    stockValuationMethod: {
      type: String,
      enum: ["FIFO", "LIFO", "WeightedAverage"],
      default: "FIFO",
    },

    defaultConsumableRateSource: {
      type: String,
      enum: ["MRP", "StoreRate", "PurchaseRate"],
      default: "StoreRate",
    },

    gstRate: { type: Number, default: 18 },

    openingStockValue: { type: Number, default: 0 },
    currentStockValue: { type: Number, default: 0 },

    minimumStockAlert: {
      enabled: { type: Boolean, default: true },
      level: { type: Number, default: 10 },
    },

    assetTrackingEnabled: { type: Boolean, default: true },

    // ---------------------------
    // Authority roles (SINGLE)
    // ---------------------------
    storeHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // accounts / owner
      required: true,
    },

    storeIncharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // ---------------------------
    // Operational staff (MULTIPLE)
    // ---------------------------
    helpers: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // drivers: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Employee",
    //   },
    // ],

    // welders: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Employee",
    //   },
    // ],

    expenseCategories: [
      {
        name: String,
        ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
      },
    ],

    ledgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      // required: true,
    },

    surcharge: {
      staffSalary: Number,
      marketing: Number,
      expenses: Number,
      investment: Number,
      tax: Number,
      profit: Number,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

storeSchema.post("save", async function (doc) {
  try {
    const ledgerId = await syncLedger({
      doc,
      type: "Store",
      under: "Inventory Accounts",
      getAddress: () => ({
        name: doc.name,
      }),
      getTaxDetails: () => ({}),
    });

    if (!doc.ledgerId && ledgerId) {
      await doc.constructor.updateOne(
        { _id: doc._id },
        { $set: { ledgerId: ledgerId } }
      );
    }
  } catch (err) {
    console.error("[Store] Ledger Sync Error", err);
  }
});

storeSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;

  try {
    const ledgerId = await syncLedger({
      doc,
      type: "Store",
      under: "Inventory Accounts",
      getAddress: () => ({
        name: doc.name,
      }),
      getTaxDetails: () => ({}),
    });

    if (!doc.ledgerId && ledgerId) {
      await doc.constructor.updateOne(
        { _id: doc._id },
        { $set: { ledgerId: ledgerId } }
      );
    }
  } catch (err) {
    console.error("[Store] Ledger Sync Update Error", err);
  }
});

const storeInventorySchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },

    reservedQuantity: {
      type: Number,
      default: 0,
    },

    averageRate: {
      type: Number,
      default: 0,
    },

    lastPurchaseRate: {
      type: Number,
      default: 0,
    },

    reorderLevel: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastUpdatedAt: Date,
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* One stock per store */
storeInventorySchema.index({ storeId: 1, stockId: 1 }, { unique: true });

/* Keep derived fields in sync */
storeInventorySchema.pre("save", function (next) {
  this.availableQuantity = this.quantity - this.reservedQuantity;
  this.stockValue = this.quantity * this.averageRate;
  this.lastUpdatedAt = new Date();
  next();
});

const storeAssetInventorySchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },

    totalQuantity: {
      type: Number,
      default: 0,
    },

    issuedQuantity: {
      type: Number,
      default: 0,
    },

    damagedQuantity: {
      type: Number,
      default: 0,
    },

    availableQuantity: {
      type: Number,
      default: 0,
    },

    isRentable: {
      type: Boolean,
      default: false,
    },

    rentPerDay: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* One asset belongs to one store at a time */
storeAssetInventorySchema.index({ storeId: 1, assetId: 1 }, { unique: true });

const storeStockMovementSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "Opening",
        "Purchase",
        "Issue",
        "Return",
        "TransferIn",
        "TransferOut",
        "Adjustment",
        "Damage",
        "Scrap",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    rate: Number,

    referenceType: String, // PR, PO, DN, Return, Adjustment
    referenceId: mongoose.Schema.Types.ObjectId,

    narration: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const StoreInventory = mongoose.model("StoreInventory", storeInventorySchema);
const StoreAssetInventory = mongoose.model(
  "StoreAssetInventory",
  storeAssetInventorySchema
);
const StoreStockMovement = mongoose.model(
  "StoreStockMovement",
  storeStockMovementSchema
);
const Store = mongoose.model("Store", storeSchema);
module.exports = {
  Store,
  StoreInventory,
  StoreAssetInventory,
  StoreStockMovement,
};
