const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    site: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        }
    },
    contractor: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contractor',
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    billOf: {
        type: Object,
    },
    billNo: {
        type: String,
        index: true,
    },
    dateOfBill: {
        type: Date,
        default: Date.now,
    },
    toPay: {
        type: String,
    },
    amount: {
        type: Number,
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    qualityApprove: {
        type: String,
        default: 'Pending'
    },
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
    contractorApprove: {
        type: String,
        default: 'Pending'
    },
    dateOfPayment: {
        type: Date,
        default: Date.now,
    },
    paidAmount: {
        type: Number,
    },
    dueAmount: {
        type: Number,
    },
    reason: {
        type: String,
    },
    approvalStatus: {
        type: String,
        default: 'Pending',
    }
}, { timestamps: true });

billSchema.pre('save', function (next) {
    const amount = parseFloat(this.amount) || 0;
    const paidAmount = parseFloat(this.paidAmount) || 0;
    console.log('billamount:', amount)
    console.log('billpaid:', paidAmount)
    const payment = amount - paidAmount;

    if (!isNaN(payment) && isFinite(payment)) {
        this.dueAmount = Math.max(0, payment.toFixed(2));
    } else {
        this.dueAmount = null;
    }

    next();
});


const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;