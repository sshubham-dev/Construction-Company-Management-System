const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    },
    siteId: {
        type: String,
        unique: true,
    },
    projectType: {
        type: String,
        default: 'Residential',
        index: true,
    },
    floors: String,
    area: Number,
    address:{
        type: String,
    }, 
    incharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    qualityEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    agreement: {
        type: String,
        content: String,
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    checklist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Check-List',
    }],
    bill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
    }],
    workOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work-Order',
    }],
    purchaseOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase-Order',
    }],
    purchaseRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase-Request',
    }],
    paymentSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment-Schedule',
    },
    projectSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project-Schedule',
    },
    contractor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
    }],
    supplier: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    }],
    extraWork: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extra-Work',
    }],
    account: {
        income: {},
        expenses: {},
        extraWork: {},
        profit: {},
        expenses: {},
        balance: {},
    },
}, { timestamps: true });

const Site = mongoose.model('Site', siteSchema);
module.exports = Site;
