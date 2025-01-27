const mongoose = require('mongoose');

const contraSchema = new mongoose.Schema({
    voucherNo: {
        type: String,
        required: true,
        unique: true
    }, // Unique identifier for the Contra voucher
    date: {
        type: Date,
        required: true
    }, // Transaction date
    description: {
        type: String
    }, // Optional narration/remarks
    fromAccount: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        }
    }, // Source account (e.g., cash, bank)
    toAccount: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        }
    }, // Destination account (e.g., cash, bank)
    amount: {
        type: Number,
        required: true
    }, // Transfer amount
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, // User who created the voucher
}, { timestamps: true });

const Contra = mongoose.model('Contra', contraSchema);
module.exports = Contra;
