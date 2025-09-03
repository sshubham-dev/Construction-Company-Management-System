const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  from: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ledger',
      required: true,
    },
  },
  to: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ledger',
      required: true,
    },
  },
  referenceNo: {
    type: String // Optional bank transaction reference for online receipts
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive'],
  },
  description: {
    type: String,
    required: true,
  },
  receiptFrom: {
    type: String,
  },
  invoiceType: {
    type: String,
  },
  invoice: [{
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refpath: 'invoiceType',
      required: true,
    },
    amount: Number, // payment received against that invoice
  }],
  costCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CostCenter',
  }
}, { timestamps: true });

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
