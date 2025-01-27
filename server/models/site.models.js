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
    floors: String,
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
        type: String,
        content: String,
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    checklist: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Checklist',
        }
    }],
    bill: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bill',
        }
    }],
    workOrder: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Work_Order',
        }
    }],
    purchaseOrder: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase_Order',
        }
    }],
    purchaseRequest: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase_Request',
        }
    }],
    paymentSchedule: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment_Schedule',
        }
    },
    projectSchedule: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project_Schedule',
        }
    },
    contractor: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contractor',
        }
    }],
    supplier: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
        }
    }],
    extraWork: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Extra_Work',
        }
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
