const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: { type: Date, 
    required: true 
  },
  amount: { type: Number, 
    required: true 
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    // required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true
  },
  purpose: { type: String },
  photo: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
