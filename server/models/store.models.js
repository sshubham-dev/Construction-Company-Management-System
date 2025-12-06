const mongoose = require("mongoose");
const { syncLedger } = require("../utils/ledgerSync");

const storeSchema = new mongoose.Schema(
  {
    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
      unique: true,
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

    priceList: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
        rate: Number,
      },
    ],

    assetRentPolicy: {
      machines: { type: Number, default: 0 },
      shuttering: { type: Number, default: 0 },
      scaffolding: { type: Number, default: 0 },
      malGadiTripRate: { type: Number, default: 0 },
      vehicleRentPerDay: { type: Number, default: 0 },
    },

    assetTrackingEnabled: { type: Boolean, default: true },

    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],

    expenseCategories: [
      {
        name: String,
        ledgerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ledger",
        },
      },
    ],

    ledgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
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

storeSchema.pre("save", async function (next) {
  try {
    const ledgerId = await syncLedger({
      doc: this,
      type: "Store",
      under: "Inventory Accounts",
      getAddress: () => ({
        name: this.name,
      }),
      getTaxDetails: () => ({}),
    });

    if (ledgerId) this.ledger = ledgerId;
    next();
  } catch (err) {
    console.error("Store Ledger Sync Error:", err);
    next(err);
  }
});

storeSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const store = await this.model.findOne(this.getQuery());
    if (!store) return next();

    const update = this.getUpdate() || {};
    if (update.$set) Object.assign(store, update.$set);
    Object.assign(store, update);

    const ledgerId = await syncLedger({
      doc: store,
      type: "Store",
      under: "Inventory Accounts",
      getAddress: () => ({
        name: store.name,
      }),
      getTaxDetails: () => ({}),
    });

    update.$set = update.$set || {};
    update.$set.ledger = ledgerId;
    this.setUpdate(update);

    next();
  } catch (err) {
    console.error("Store Ledger Sync Update Error:", err);
    next(err);
  }
});

const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);
module.exports = Store;
