const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  name: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['client', 'contractor', 'supplier', 'employee'], // Specify the allowed models
    },
  },
  alias: {
    type: String,
  },
  under: {
    type: String,
    required: true,
  },
  statutoryDetails: {
    isTDSDeductible: {
      type: Boolean,
      default: false,
    },
    isGSTApplicable: {
      type: Boolean,
      default: false,
    },
  },
  mailingDetails: {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
    },
  },
  bankingDetails: {
    name: String,
    acNo: Number,
    ifscCode: String,
    bankname: String,
    branch: String,
  },
  taxRegistrationDetails: {
    panNo: {
      type: String,
    },
    gstin: {
      type: String,
    },
  },
  openingBalance: {
    type: Number,
    default: 0,
  },
  payable: {
    type: Number,
  },
  receivable: {
    type: Number,
  },
  paid: {
    type: Number,
  },
  due: {
    type: Number,
  },
}, { timestamps: true });

const Ledger = mongoose.model('Ledger', ledgerSchema);

module.exports = Ledger;


const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  alias: { type: String },
  under: { type: String, required: true, default: 'primary' }, // Reference to parent group
  nature: { type: String, enum: ['assets', 'liabilities', 'income', 'expenses'] }
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);


const costCenterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // Cost Center Name
  alias: { type: String },  // Alternative Name
  under: { type: mongoose.Schema.Types.ObjectId, ref: "CostCenter", default: null },  // Parent Cost Center
  isPrimary: { type: Boolean, default: false },  // Primary Cost Center
  isActive: { type: Boolean, default: true },  // Active/Inactive Status
  description: { type: String },  // Additional Notes
  createdAt: { type: Date, default: Date.now },  // Creation Date
}, { timestamps: true });

module.exports = mongoose.model("CostCenter", costCenterSchema);
