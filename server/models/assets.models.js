const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    // ---------------------------
    // Identification
    // ---------------------------
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Machine",
        "Shuttering",
        "Scaffolding",
        "Vehicle",
        "IT",
        "Tool",
        "OfficeAsset",
        "Other",
      ],
      required: true,
    },

    assetCode: {
      type: String,
      unique: true,
      trim: true,
      // Example: MACH-001, SHUT-045, IT-030
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: false,
      // Only if linked to your stock master
    },

    // ---------------------------
    // Ownership (Store = BU)
    // ---------------------------
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    // ---------------------------
    // Purchase Details
    // ---------------------------
    purchaseDetails: {
      supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
      purchaseDate: Date,
      purchaseRate: Number,
      billNo: String,
    },

    // ---------------------------
    // Current Status
    // ---------------------------
    status: {
      type: String,
      enum: ["Available", "Issued", "InRepair", "Lost", "Scrapped"],
      default: "Available",
    },

    currentHolder: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "holderType",
      // user/site/businessUnit
    },

    holderType: {
      type: String,
      enum: ["User", "Site", "BusinessUnit", null],
      default: null,
    },

    // ---------------------------
    // Issue History
    // ---------------------------
    issueHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssetIssue",
      },
    ],

    // ---------------------------
    // Maintenance / Repair Logs
    // ---------------------------
    maintenance: [
      {
        date: { type: Date, default: Date.now },
        description: String,
        cost: Number,
        performedBy: String, // internal/external vendor
      },
    ],

    // ---------------------------
    // Depreciation (optional future)
    // ---------------------------
    depreciatedValue: Number,
    expectedLifeMonths: Number,

    // ---------------------------
    // Custom Fields (future use)
    // ---------------------------
    additionalInfo: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const assetIssueSchema = new mongoose.Schema(
  {
    // -----------------------------
    // Link to Asset
    // -----------------------------
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    // -----------------------------
    // Issue From (Store / BU)
    // -----------------------------
    issuedByBU: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
      // Store that owns this asset
    },

    issuedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // store manager or operator
    },

    // -----------------------------
    // Issue To (Responsible Party)
    // -----------------------------
    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "issuedToType",
    },

    issuedToType: {
      type: String,
      enum: ["User", "Site", "BusinessUnit"],
      required: true,
      // Site (construction site)
      // User (staff member)
      // BusinessUnit (office/store/other branch)
    },

    // -----------------------------
    // Issue Details
    // -----------------------------
    issueDate: {
      type: Date,
      default: Date.now,
    },

    expectedReturnDate: Date,

    // -----------------------------
    // Usage Tracking
    // -----------------------------
    rentRate: Number, // rate based on unit
    rentUnit: {
      type: String,
      enum: ["Day", "Hour", "Trip", "None"],
      default: "None",
    },

    usage: {
      daysUsed: { type: Number, default: 0 },
      hoursUsed: { type: Number, default: 0 },
      tripsUsed: { type: Number, default: 0 }, // for mal gadi
    },

    calculatedRent: { type: Number, default: 0 },

    // -----------------------------
    // Return Details
    // -----------------------------
    returnDate: Date,

    returnReceivedByBU: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      // Normally same as issuedByBU
    },

    returnReceivedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["Issued", "Returned", "Lost", "Damaged"],
      default: "Issued",
    },

    // -----------------------------
    // Damage / Loss Reporting
    // -----------------------------
    damageReport: {
      isDamaged: { type: Boolean, default: false },
      damageDescription: String,
      damageCost: Number,
    },

    lossReport: {
      isLost: { type: Boolean, default: false },
      lossCost: Number,
    },

    // -----------------------------
    // Accounting Integration
    // -----------------------------
    ledgerEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    },

    // -----------------------------
    // Notes
    // -----------------------------
    remarks: String,
  },
  { timestamps: true }
);

const Assets = mongoose.model("Asstes", assetSchema);
const AssetIssue = mongoose.model("AssetIssue", assetIssueSchema);
module.exports = { Assets, AssetIssue };
