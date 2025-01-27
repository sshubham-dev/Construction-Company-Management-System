const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    item: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
            required: true,
        }
    },
    reqQuantity: {
        type: Number,
    },
    approvedQuantity: {
        type: Number,
    },
    unit: {
        type: String,
    },
    slip: {
        type: String,
        content: String,
    },
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
    to:{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory',
        }
    },
    createdBy: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    requirementFor: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    requirement: [requirementSchema],
    reqDate: Date,
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    accountApprove: {
        type: String,
        default: 'Pending'
    },
    storeApprove: {
        type: String,
        default: 'Pending'
    },
    approvalStatus: {
        type: String,
        default: 'Pending'
    },
}, { timestamps: true });


const PurchaseRequest = mongoose.model('Purchase-Request', purchaseRequestSchema);
module.exports = PurchaseRequest;