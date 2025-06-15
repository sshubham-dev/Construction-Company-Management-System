const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    client: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        }
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
    floors: [{
        name: String,
        area: Number,
        unit: String,
    }],
    area: Number,
    address: {
        type: String,
    },
    incharge: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    qualityEngineer: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    supervisor: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    agreement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agreement'
    },
    approval: [{
        for: String,
        by: String,
        status: {
            type: String,
            default: "Pending"
        },
    }],
    checklist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checklist',
    }],
    bill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
    }],
    workOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work_Order',
    }],
    purchaseOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase_Order',
    }],
    purchaseRequest: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase_Request',

    }],
    paymentSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment_Schedule',
    },
    qualitySchedule: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quality_Schedule',
    }],
    projectSchedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project_Schedule',
    },
    contractor: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contractor',
        }
    }],
    extraWork: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extra_Work',
    }],
    expenses: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        amount: Number,
        name: String,
        type: {
            type: String,
            enum: ['Payment', 'Expenses']
        },
    }],
    income: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Receipt'
        },
        amount: Number,
    }],
    account: {
        receivable: {
            type: Number,
        },
        income: {
            type: Number,
        },
        expenses: {
            type: Number,
        },
        profit: {
            type: Number,
        },
        balance: {
            type: Number,
        },
    },
    materialExp: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
        },
    }],
    ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger'
    }
}, { timestamps: true });

const Site = mongoose.model('Site', siteSchema);
module.exports = Site;
