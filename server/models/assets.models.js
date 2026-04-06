const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    assetCode: { type: String, unique: true },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },

    status: {
      type: String,
      enum: ["AVAILABLE", "ISSUED", "UNDER_MAINTENANCE", "SCRAPPED"],
      default: "AVAILABLE",
    },
    condition: {
      type: String,
      enum: ["GOOD", "AVERAGE", "DAMAGED"],
      default: "GOOD",
    },

    purchaseDate: Date,
    purchaseCost: Number,

    serialNumber: String,

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    isRentable: {
      type: Boolean,
      default: false,
    },
    rent: {
      type: Number,
      default: 0,
    },

    maintenanceIntervalDays: Number,

    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const assetIssueSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },

    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    issuedToType: {
      type: String,
      enum: ["Site", "Employee"],
      required: true,
    },

    issuedToId: {
      type: mongoose.Schema.Types.ObjectId,
      refpath: issuedToType,
      required: true,
      index: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    expectedReturnDate: Date,
    actualReturnDate: Date,

    issueCondition: {
      type: String,
      enum: ["New", "Good", "Used"],
      default: "Good",
    },

    returnCondition: {
      type: String,
      enum: ["Good", "Damaged", "Scrap"],
    },

    rentPerDay: Number,
    totalRent: Number,

    status: {
      type: String,
      enum: ["ISSUED", "RETURNED", "OVERDUE", "LOST"],
      default: "ISSUED",
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: String,
  },
  { timestamps: true },
);
/* 🔧 RENT CALCULATION */
assetIssueSchema.pre("save", function () {
  if (this.actualReturnDate && this.issueDate && this.rentPerDay) {
    const days =
      (this.actualReturnDate - this.issueDate) / (1000 * 60 * 60 * 24);

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
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },

    maintenanceType: {
      type: String,
      enum: ["REPAIR", "SERVICE", "INSPECTION"],
    },

    cost: Number,

    description: String,

    nextDueDate: Date,

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "COMPLETED",
    },
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
