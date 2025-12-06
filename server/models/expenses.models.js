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
  purpose: { type: String, required: true },
  photo: String ,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approval: { type: String, default: 'Pending' },
status: {
  type: String,
  enum: ["for approval", "approved", "paid", "rejected"],
  default: "for approval"
}
}, { timestamps: true });

const Expenses = mongoose.model('Expense', expenseSchema);
module.exports = Expenses;
