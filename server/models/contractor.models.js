const mongoose = require('mongoose');
const { syncLedger } = require('../utils/ledgerSync');

const contractorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
        type: Number,
    },
    address: {
        type: String,
        // street: String,
        // city: String,
        // district: String,
        // state: String,
    },
    addhar: {
        type: String,
    },
    panNo: {
        type: String,
    },
    bank: {
        type: String,
    },
    jobWork: {
        type: String,
    },
    gstNo: {
        type: String,
    },
    isUser: Boolean,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    checklist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checklist',
    }],
    extraWork: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extra_Work',
    }],
    bill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
    }],
    site: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        }
    }],
    workOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work_Order'
    }],
    ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger',
    },
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
    }],
    // Site-wise work and billing
    projects: [{
        site: {
            name: String,
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
        },
        workOrderValue: Number,
        billsGenerated: Number,
        paid: Number,
        due: Number,
    }],
    // Financial summary
    totalWorkOrder: {
        type: Number,
        default: 0,
    },
    totalBilled: {
        type: Number,
        default: 0,
    },
    totalPaid: {
        type: Number,
        default: 0,
    },
    totalDue: {
        type: Number,
        default: 0,
    },
    account: {
        advance: Number, // Optional, if advance paid
        pendingWorkValue: Number, // Optional
    },
    status: {
        type: String,
        default: 'Active',
        enum: ['Active', 'Inactive', 'Blocked'],
    }
}, { timestamps: true })

contractorSchema.pre('save', async function (next) {
    try {
        const ledgerId = await syncLedger({
            doc: this,
            type: 'Contractor',
            fieldsToWatch: ['name', 'gstNo', 'panNo', 'address', 'email', 'phone', 'whatsapp'],
            under: 'Sundry Creditors',
            getAddress: (doc) => ({
                name: doc.name,
                address: doc.address,
            }),
            getTaxDetails: (doc) => ({
                gstNo: doc.gstNo || '',
                panNo: doc.panNo || ''
            }),
        });
    if (ledgerId) this.ledger = ledgerId;
        next();
    } catch (err) {
        console.error('Error in contractor ledger sync:', err);
        next(err);
    }
});

const Contractor = mongoose.model('Contractor', contractorSchema);
module.exports = Contractor;