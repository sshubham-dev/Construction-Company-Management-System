const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    alias: String,
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    referenceType: String, // dynamic reference type name
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceType",
      default: null,
    },
    statutoryDetails: {
      isTDSDeductible: { type: Boolean, default: false },
      isGSTApplicable: { type: Boolean, default: false },
    },
    mailingDetails: {
      name: String,
      phoneNo: String,
      email: String,
      address: String,
      state: String,
    },
    bankingDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },
    taxDetails: {
      panNo: String,
      gstNo: String,
    },
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 }, // can be recalculated
    summary: {
      payable: { type: Number, default: 0 },
      receivable: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      received: { type: Number, default: 0 },
      due: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // Parent Group (Tally style)
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    // Nature of Group (Accounting classification)
    nature: {
      type: String,
      enum: ["ASSET", "LIABILITY", "INCOME", "EXPENSES"],
      required: true,
    },

    // Helpful for reporting and automated ledger behavior
    affectsGrossProfit: { type: Boolean, default: false },

    isReserved: { type: Boolean, default: false },
    // Example reserved groups: Bank Accounts, Cash-in-Hand, Duties & Taxes
  },
  { timestamps: true },
);

const costCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // Cost Center Name
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
      default: null,
    },
    isActive: { type: Boolean, default: true }, // Active/Inactive Status
    type: { type: String, required: true },
    reference: { type: mongoose.Schema.Types.ObjectId, refPath: "type" }, // Dynamic reference
  },
  { timestamps: true },
);

costCenterSchema.index({ name: 1, companyId: 1 }, { unique: true });

ledgerSchema.index(
  { referenceType: 1, referenceId: 1, companyId: 1 },
  { unique: true },
);

groupSchema.index({ name: 1, companyId: 1 }, { unique: true });

const Group = mongoose.model("Group", groupSchema);
const Ledger = mongoose.model("Ledger", ledgerSchema);
const CostCenter = mongoose.model("CostCenter", costCenterSchema);

module.exports = { Ledger, Group, CostCenter };
