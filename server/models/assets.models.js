const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  name: String,
  code: String,

  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },

  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },

  status: {
    type: String,
    enum: ["AVAILABLE", "ISSUED", "MAINTENANCE", "SCRAP"],
    default: "AVAILABLE",
  },

  condition: String,

  purchaseDate: Date,
  purchasePrice: Number,

  serialNo: String,

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  isRentable: Boolean,
  rentPerDay: Number,

  maintenanceIntervalDays: Number,

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const assetIssueSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },

  issuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "issuedToModel",
  },

  issuedToModel: {
    type: String,
    enum: ["Store", "User"],
    required: true,
  },

  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  issuedAt: { type: Date, default: Date.now },

  expectedReturnDate: Date,

  returnedAt: Date,

  issueCondition: String,
  returnCondition: String,

  rentPerDay: Number,          // ✅ moved here
  totalRent: Number,           // ✅ calculated

  status: {
    type: String,
    enum: ["ISSUED", "RETURNED", "OVERDUE"],
    default: "ISSUED",
  },

  remarks: String,
}, { timestamps: true });

assetSchema.index({ code: 1 }, { unique: true });

/* 🔧 RENT CALCULATION */
assetIssueSchema.pre("save", function () {
  if (this.returnedAt && this.issuedAt && this.rentPerDay) {
    const days =
      (this.returnedAt - this.issuedAt) / (1000 * 60 * 60 * 24);

    this.totalRent = Math.max(1, Math.ceil(days)) * this.rentPerDay;
  }
});
assetIssueSchema.virtual("overdueDays").get(function () {
  if (this.status === "Overdue" && this.expectedReturnDate) {
    const today = new Date();
    const diff = (today - this.expectedReturnDate) / (1000 * 60 * 60 * 24);

    return Math.floor(diff);
  }
  return 0;
});

const assetMaintenanceSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    type: {
      type: String,
      enum: ["REPAIR", "SERVICE"],
    },

    cost: Number,

    description: String,

    performedBy: String,
  },
  { timestamps: true },
);

const Asset = mongoose.model("Asset", assetSchema);
const AssetMaintenance = mongoose.model(
  "AssetMaintenance",
  assetMaintenanceSchema,
);
const AssetIssue = mongoose.model("AssetIssue", assetIssueSchema);
module.exports = {
  Asset,
  AssetIssue,
  AssetMaintenance,
};
