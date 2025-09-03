const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  referenceType: {
    type: String,
  },

  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true,
    refPath: 'referenceType', // dynamic reference
  },

  alias: {
    type: String,
  },

  under: {
    type: String,
  },

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
  currentBalance: { type: Number, default: 0 },

  // Summary stats (optional for reporting)
  payable: { type: Number, default: 0 },
  receivable: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  transaction: [{
    id: { type: mongoose.Schema.Types.ObjectId },
    type: { type: String, enum: ['Contra', 'Payment', 'Receipt', 'Journal', 'Expenses'] },
    amount: { type: Number },
    date: { type: Date, default: Date.now },
  }]
}, { timestamps: true });


const Ledger = mongoose.model('Ledger', ledgerSchema);


const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  alias: { type: String },
  under: { type: String, required: true, default: 'Primary' }, // Reference to parent group
  nature: { type: String, enum: ['Assets', 'Liability', 'Income', 'Expenses'] }
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);


const costCenterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // Cost Center Name
  type: { type: String, required: true },
  under: { type: String, default: 'Primary' },  // Parent Cost Center
  isActive: { type: Boolean, default: true },  // Active/Inactive Status
  description: { type: String },  // Additional Notes
  referenceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'type' },  // Dynamic reference
}, { timestamps: true });

const CostCenter = mongoose.model("CostCenter", costCenterSchema);

module.exports = { Ledger, Group, CostCenter };