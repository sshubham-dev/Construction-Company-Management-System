const mongoose = require('mongoose');

const paymentDetailSchema = new mongoose.Schema({
    workDescription: {
        type: String,
    },
    amount: Number,
    paymentDate: {
        type: Date,
    },
    dueDate: Date,
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
}, { timestamps: true });

const paymentScheduleSchema = new mongoose.Schema({
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
    client: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
        }
    },
    adminApproved: {
        type: String,
        default: 'Pending'
    },
    paymentDetails: [paymentDetailSchema],
    totalValue: {
        type: Number,
    },
    amountPaid: {
        type: Number,
    },
    amountdue: {
        type: Number,
    },
    createdBy: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    clientApprove: {
        type: String,
        default: 'Pending'
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    approvalStatus: {
        type: String,
        default: 'Pending'
    },
});

paymentScheduleSchema.pre('save', function (next) {
    const PaymentDetails = this.paymentDetails;
    console.log('PaymentDetails:', PaymentDetails)

    PaymentDetails.map((detail) => {
        const amount = parseFloat(detail.amount) || 0;
        const paidAmount = parseFloat(detail.paid) || 0;
        console.log('amount:', amount)
        console.log('paid:', paidAmount)
        const payment = amount - paidAmount;

        // Check if payment is a valid number
        if (!isNaN(payment) && isFinite(payment)) {
            // Set dueAmount to a positive value or 0
            detail.due = Math.max(0, payment.toFixed(2));
        } else {
            detail.due = null;
        }
        console.log('due:', detail.due)
    })

    function total(amount, value) {
        return amount + value
    };
    const TotalAmount = PaymentDetails.map((detail) => {
        return detail.amount;
    });
    console.log('TotalAmount:', TotalAmount)
    this.totalValue = TotalAmount.reduce(total)
    // console.log('totalValue:', this.totalValue)

    const amount = parseFloat(this.totalValue) || 0;
    const paidAmount = parseFloat(this.amountPaid) || 0;
    console.log('Totalamount:', amount)
    console.log('Totalpaid:', paidAmount)
    const payment = amount - paidAmount;

    // Check if payment is a valid number
    if (!isNaN(payment) && isFinite(payment)) {
        // Set dueAmount to a positive value or 0
        this.amountdue = Math.max(0, payment.toFixed(2));
    } else {
        this.amountdue = null;
    }

    next();
});

const Payment_Schedule = mongoose.model('Payment_Schedule', paymentScheduleSchema);
module.exports = Payment_Schedule;
