const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
    recordFor: String,
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger',
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    paidTo: String,
    unit: String,
    amount: Number,
    quantity: Number,
    rate: Number,
    paymentMode: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
    purpose: {
        type: String,
        required: true,
    },
    remarks: {
        type: String,
    },
    slip: {
        type: String,
    }
}, { timestamps: true });

const Expenses = mongoose.model('Expenses', expensesSchema);
module.exports = Expenses;