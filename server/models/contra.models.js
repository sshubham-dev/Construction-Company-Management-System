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
    from: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        }
    }, // Source account (e.g., cash, bank)
    to: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        }
    }, // Destination account (e.g., cash, bank)
    amount: {
        type: Number,
        required: true
    }, // Transfer amount
    description: {
        type: String
    }, // Optional narration/remarks
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, // User who created the voucher
}, { timestamps: true });

const Contra = mongoose.model('Contra', contraSchema);
module.exports = Contra;
