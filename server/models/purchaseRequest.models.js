const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    item: {
        type: String,
        // id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Stock',
        // }
    },
    request: {
        quantity: Number,
        unit: String,
        remarks: String,
    },
    approved: {
        quantity: Number,
        unit: String,
        remarks: String,
    },
    delivered: {
        quantity: Number,
        unit: String,
        remarks: String,
    }
}, { timestamps: true });

const purchaseRequestSchema = new mongoose.Schema({
    site: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        }
    },
    date: {
        type: Date,
        default: Date.now,
    },
    to: {
        name: String,
        // id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Inventory',
        // }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    requirementFor: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    requirement: [requirementSchema],
    status: {
        type: String,
        default: 'request',
        enum: ['request', 'approved', 'delivery', 'delivered']
    },
    reqDate: Date,
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    accountantApprove: {
        type: String,
        default: 'Pending'
    },
    accountheadApprove: {
        type: String,
        default: 'Pending'
    },
    inchargeApprove: {
        type: String,
        default: 'Pending'
    },
    approvalStatus: {
        type: String,
        default: 'Pending'
    },
}, { timestamps: true });


const PurchaseRequest = mongoose.model('Purchase_Request', purchaseRequestSchema);
module.exports = PurchaseRequest;


