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
  to: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Account',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  bill: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Bill',
    required: true
  }]
});

const Payment = mongoose.model('Payment', paymentSchema)
module.exports = Payment