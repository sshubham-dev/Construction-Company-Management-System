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
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    isUser: Boolean,
    purchaseOrder: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase-Order',
        },
    }],
    bill: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bill',
        }
    }],
    accounts:{
        payable:{
            type: Number,
        },
        paid:{
            type: Number,
        },
        due:{
            type: Number,
        },
    }
}, { timestamps: true })

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;