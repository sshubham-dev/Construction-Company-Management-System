const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    contactNo: {
        type: Number
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
    purchaseOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase-Order',
    }],
    bill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
    }],
}, { timestamps: true })

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;