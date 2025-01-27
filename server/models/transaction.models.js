const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    site: {
        name: String,
        siteId: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
    },
    modeOfPayment: {
        name: String,
        accountId: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    date: {
        type: Date,
        required: true,
    },
    purpose: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    typeOfTransaction: {
        type: String,
        enum: ['Dr', 'Cr']
    }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;