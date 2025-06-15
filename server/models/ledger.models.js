const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  refrenceType:{
    type: String,
  },
  refrenceId:{
    type: mongoose.Schema.Types.ObjectId,
  },
  alias: {
    type: String,
  },
  under: {
    type: String,
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
  received:{
    type: Number,
  },
  balance:{
    type:Number,
  },
  transaction:[{
    id:{
      type:mongoose.Schema.Types.ObjectId,
    },
    type:{
      type: String,
      enum:['Contra', 'Payment', 'Receipt', 'Journal']
    },
    amount:{
      type: Number,
    }
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
  alias: { type: String },  // Alternative Name
  under: { type: mongoose.Schema.Types.ObjectId, ref: "CostCenter", default: null },  // Parent Cost Center
  isPrimary: { type: Boolean, default: false },  // Primary Cost Center
  isActive: { type: Boolean, default: true },  // Active/Inactive Status
  description: { type: String },  // Additional Notes
  createdAt: { type: Date, default: Date.now },  // Creation Date
}, { timestamps: true });

const CostCenter = mongoose.model("CostCenter", costCenterSchema);

module.exports = {Ledger, Group, CostCenter};