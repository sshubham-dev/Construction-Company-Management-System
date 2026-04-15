const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, index: true },

    type: {
      type: String,
      enum: ["STORE", "SITE"],
      default: "STORE",
    },

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
      index: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    costCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
    },

    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },

    isCentralStore: { type: Boolean, default: false },

    storeHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    storeIncharge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    surcharge: {
      staffSalary: Number,
      expenses: Number,
      investment: Number,
      profit: Number,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const inventoryTransactionSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },

    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },

    type: {
      type: String,
      enum: [
        "OPENING",
        "GRN",
        "DN",
        "ISSUE",
        "TRANSFER",
        "RETURN",
        "ADJUSTMENT",
      ],
      required: true,
    },

    qtyIn: { type: Number, default: 0 },
    qtyOut: { type: Number, default: 0 },

    rate: Number,
    value: Number,

    fromStoreId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    toStoreId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },

    referenceType: String,
    referenceId: mongoose.Schema.Types.ObjectId,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    narration: String,
  },
  { timestamps: true },
);

const InventoryTransaction = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema,
);
const Store = mongoose.model("Store", storeSchema);

module.exports = {
  Store,
  InventoryTransaction,
};
