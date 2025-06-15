const mongoose = require('mongoose');

var paymentSchema = new mongoose.Schema({
  paymentNo: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
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
    // type: {
    //   type: String,
    //   required: true,
    //   enum: ['Client', 'Supplier', 'Contractor', 'User', 'Employee'], // Specify the allowed models
    // },
  },
  referenceNo: {
    type: String, // Optional bank transaction reference for online payments
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  paymentFor: {
    type: String,
    trim: true,
  },
  invoice: [{
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: String,
      enum: ['Invoice', 'Bill', 'ExtraWork'], // Specify the allowed models
    },
  }],
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema)
module.exports = Payment