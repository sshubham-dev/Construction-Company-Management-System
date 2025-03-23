const mongoose = require('mongoose');

const workDetailSchema = new mongoose.Schema({
    workDetail: {
        type: String,
    },
    rate: {
        type: Number,
    },
    area: {
        type: Number,
    },
    unit: {
        type: String,
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    paid: {
        type: Number,
    },
    due: {
        type: Number,
    },
    bill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
    }],
}, { timestamps: true });

const workOrderSchema = new mongoose.Schema({
    workOrderName: {
        type: String,
        index: true,
    },
    workOrderNo: {
        type: String,
        unique: true,
        index: true
    },
    contractor: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contractor',
        }
    },
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    work: [workDetailSchema],
    workOrderValue: {
        type: Number,
    },
    startdate: {
        type: Date,
    },
    duration: {
        type: Date,
    },
    totalPaid: {
        type: Number,
    },
    totalDue: {
        type: Number,
    },
    approvalStatus: {
        type: String,
        default: 'Pending'
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    contractorApprove: {
        type: String,
        default: 'Pending'
    },
    inchargeApprove: {
        type: String,
        default: 'Pending'
    },
    accountheadApprove: {
        type: String,
        default: 'Pending'
    },
}, { timestamps: true });


workOrderSchema.pre('save', function (next) {
    const WorkDetails = this.work;
    // console.log('WorkDetails:', WorkDetails)

    WorkDetails.map((detail) => {
        const amount = parseFloat(detail.amount) || 0;
        const paidAmount = parseFloat(detail.paid) || 0;
        // console.log('workOrderamount:', amount)
        // console.log('workOrderpaid:', paidAmount)
        const payment = amount - paidAmount;

        if (!isNaN(payment) && isFinite(payment)) {
            detail.due = Math.max(0, payment.toFixed(2));
        } else {
            detail.due = null;
        }
        // console.log('workOrderdue:', detail.due)
    })

    function total(amount, value) {
        return amount + value
    };
    const TotalAmount = WorkDetails.map((detail) => {
        return detail.amount;
    });
    const TotalPaid = WorkDetails.map((detail) => {
        return detail.paid;
    });
    // console.log('TotalAmountworkOrder:', TotalAmount)
    this.workOrderValue = TotalAmount.reduce(total)
    this.totalPaid = TotalPaid.reduce(total)
    // console.log('totalValue:', this.totalValue)

    const amount = parseFloat(this.workOrderValue) || 0;
    const paidAmount = parseFloat(this.totalPaid) || 0;
    // console.log('TotalamountworkOrder:', amount)
    // console.log('TotalpaidworkOrder:', paidAmount)
    const payment = amount - paidAmount;

    if (!isNaN(payment) && isFinite(payment)) {
        this.totalDue = Math.max(0, payment.toFixed(2));
    } else {
        this.totalDue = null;
    }
    next();
});

const WorkOrder = mongoose.model('Work_Order', workOrderSchema);

module.exports = WorkOrder;
