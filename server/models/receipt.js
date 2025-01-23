const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  client: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: accounts,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  invoice: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const Receipt = mongoose.Schema('Receipt', receiptSchema);
module.exports = Receipt;