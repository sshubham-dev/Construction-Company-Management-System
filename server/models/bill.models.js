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
    billType:{
        type: String,
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
        type: Number,
    },
    reference:Object,
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
    paid: {
        type: Number,
    },
    due: {
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

billSchema.pre('save', function () {
    const amount = parseFloat(this.toPay) || 0;
    const paid = parseFloat(this.paid) || 0;
    // console.log('billamount:', amount)
    // console.log('billpaid:', paidAmount)
    const payment = amount - paid;

    if (!isNaN(payment) && isFinite(payment)) {
        this.due = Math.max(0, payment.toFixed(2));
    } else {
        this.due = null;
    }

    return
});


const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;