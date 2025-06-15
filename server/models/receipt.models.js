const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  from: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ledger',
      required: true,
    },
    // type: {
    //   type: String,
    //   required: true,
    //   enum: ['Client', 'Supplier', 'Contractor', 'User', 'Employee'], // Specify the allowed models
    // },
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
  },
  description: {
    type: String,
    required: true,
  },
  invoice: [{
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: String,
      enum: ['Invoice', 'Bill', 'Extra_Work', 'Payment_Schedule', 'Return_Order'], // Specify the allowed models
    },
  }],
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
