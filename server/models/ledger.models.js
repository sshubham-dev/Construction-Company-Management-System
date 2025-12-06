const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    narration: String,
    debitAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
    creditAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
    amount: { type: Number, required: true },
    voucherType: {
      type: String,
      enum: ["Contra", "Payment", "Receipt", "Journal", "Expenses"],
    },
    voucherRef: { type: mongoose.Schema.Types.ObjectId }, // link to voucher document
    paymentMode: { type: String }, // Cash, Bank, UPI, Cheque
    drCr: { type: String, enum: ["Dr", "Cr"] }, // Debit or Credit

    counterpartLedger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
    }, // opposite entry
    balanceAfter: Number, // balance after this entry
  },
  { timestamps: true }
);

const ledgerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    alias: String,
    referenceType: String, // dynamic reference type name
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceType",
    },
    under: String, // grouping name
    statutoryDetails: {
      isTDSDeductible: { type: Boolean, default: false },
      isGSTApplicable: { type: Boolean, default: false },
    },
    mailingDetails: {
      name: String,
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
    taxRegistrationDetails: {
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
    transactions: [ledgerEntrySchema], // optional quick history
  },
  { timestamps: true }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    alias: { type: String, trim: true },

    // Parent Group (Tally style)
    under: {
      type: String,
      required: true,
      default: "Primary",
      trim: true,
    },

    // Nature of Group (Accounting classification)
    nature: {
      type: String,
      enum: ["Assets", "Liability", "Income", "Expenses"],
      required: true,
    },

    // Helpful for reporting and automated ledger behavior
    affectsGrossProfit: { type: Boolean, default: false },

    isReserved: { type: Boolean, default: false },
    // Example reserved groups: Bank Accounts, Cash-in-Hand, Duties & Taxes
  },
  { timestamps: true }
);

const costCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Cost Center Name
    type: { type: String, required: true },
    under: { type: String, default: "Primary" }, // Parent Cost Center
    isActive: { type: Boolean, default: true }, // Active/Inactive Status
    description: { type: String }, // Additional Notes
    referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: "type" }, // Dynamic reference
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);
const Ledger = mongoose.model("Ledger", ledgerSchema);
const CostCenter = mongoose.model("CostCenter", costCenterSchema);

module.exports = { Ledger, Group, CostCenter };
