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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    approvalOf: {
        type: String,
        required: true,
    },
    isApproved: {
        type: Boolean,
    },
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalOf: {
        type: String,
    }
}, { timestamps: true });

// const adminApprovalSchema = new mongoose.Schema({
//     data: {
//         type: Object,
//     },
//     date: {
//         type: Date,
//         default: Date.now(),
//     },
//     to: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     approvalOf: {
//         type: String,
//     },
//     isApproved: {
//         type: Boolean,
//     },
// }, { timestamps: true });

// const clientApprovalSchema = new mongoose.Schema({
//     data: {
//         type: Object,
//     },
//     date: {
//         type: Date,
//         default: Date.now(),
//     },
//     to: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     approvalOf: {
//         type: String,
//     },
//     isApproved: {
//         type: Boolean,
//     },
// }, { timestamps: true });

// const inchargeApprovalSchema = new mongoose.Schema({
//     data: {
//         type: Object,
//     },
//     date: {
//         type: Date,
//         default: Date.now(),
//     },
//     to: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     approvalOf: {
//         type: String,
//     },
//     isApproved: {
//         type: Boolean,
//     },
// }, { timestamps: true });

// const accountantApprovalSchema = new mongoose.Schema({
//     data: {
//         type: Object,
//     },
//     date: {
//         type: Date,
//         default: Date.now(),
//     },
//     isApproved: {
//         type: Boolean,
//     },
//     to: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }
// }, { timestamps: true });

// const qualityApprovalSchema = new mongoose.Schema({
//     data: {
//         type: Object,
//     },
//     date: {
//         type: Date,
//         default: Date.now(),
//     },
//     to: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     approvalOf: {
//         type: String,
//     },
//     isApproved: {
//         type: Boolean,
//     },
// }, { timestamps: true });

// const contractorApprovalSchema = new mongoose.Schema({
//     data: {
//         type: Object,
//     },
//     date: {
//         type: Date,
//         default: Date.now(),
//     },
//     to: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     approvalOf: {
//         type: String,
//     },
//     isApproved: {
//         type: Boolean,
//     },
// }, { timestamps: true });

// const supplierApprovalSchema = new mongoose.Schema({
//     data: {
//         type: Object,
//     },
//     date: {
//         type: Date,
//         default: Date.now(),
//     },
//     to: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     approvalOf: {
//         type: String,
//     },
//     isApproved: {
//         type: Boolean,
//     },
// }, { timestamps: true });


const Approval = mongoose.model('Pending-Approval', approvalSchema);
const Approved = mongoose.model('Approved-Items', approvedSchema);
const Rejected = mongoose.model('Rejected-Approval', rejectSchema);
// const AdminApproval = mongoose.model('Admin-Approval', adminApprovalSchema);
// const ClientApproval = mongoose.model('Client-Approval', clientApprovalSchema);
// const InchargeApproval = mongoose.model('Incharge-Approval', inchargeApprovalSchema);
// const AccountantApproval = mongoose.model('Accountant-Approval', accountantApprovalSchema);
// const QualityApproval = mongoose.model('Quality-Approval', qualityApprovalSchema);
// const ContractorApproval = mongoose.model('Contractor-Approval', contractorApprovalSchema);
// const SupplierApproval = mongoose.model('Supplier-Approval', supplierApprovalSchema);


module.exports = {
    Rejected,
    Approval,
    Approved
    // AdminApproval,
    // ClientApproval,
    // InchargeApproval,
    // AccountantApproval,
    // QualityApproval,
    // ContractorApproval,
    // SupplierApproval,
}