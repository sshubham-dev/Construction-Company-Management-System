const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    paymentMode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const Investment = mongoose.model("Investment", investmentSchema);
module.exports = Investment;