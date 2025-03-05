const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: Number,
        required: true,
    },
    whatsapp: {
        type: Number
    },
    address: {
        type: String,
    },
    gst: {
        type: String,
    },
    bank: {
        type: String,
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    jobWork: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isUser: Boolean,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    purchaseOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase-Order',
    }],
    accounts: {
        payable: {
            type: Number,
        },
        paid: {
            type: Number,
        },
        due: {
            type: Number,
        },
    }
}, { timestamps: true })

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;