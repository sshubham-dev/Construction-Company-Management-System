const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
    data: {
        type: Object,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    to: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    by: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    approvalOf: {
        type: String,
        required: true,
    },
    isApproved: {
        type: Boolean,
    },
    remarks: {
        type: String,
    }
}, { timestamps: true });

const approvedSchema = new mongoose.Schema({
    data: {
        type: Object,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    by: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    approvalOf: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const rejectSchema = new mongoose.Schema({
    data: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    message: {
        type: String,
    },
    by: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    approvalOf: {
        type: String,
    }
}, { timestamps: true });


const Approval = mongoose.model('Pending_Approval', approvalSchema);
const Approved = mongoose.model('Approved_Items', approvedSchema);
const Rejected = mongoose.model('Rejected_Approval', rejectSchema);

module.exports = {
    Rejected,
    Approval,
    Approved

}