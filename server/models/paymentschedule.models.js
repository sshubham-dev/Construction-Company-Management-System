const mongoose = require('mongoose');

const paymentDetailSchema = new mongoose.Schema({
    workDescription: {
        type: String,
    },
    amount: Number,
    paymentDate: {
        type: Date,
    },
    dueDate: {
        type: Date,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    received: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Receipt'
        },
        amount: Number,
    }],
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    clientApprove: {
        type: String,
        default: 'Pending'
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    accountheadApprove: {
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

    function total(amount, value) {
        return amount + value
    };
    PaymentDetails.map((detail) => {
        const amount = parseFloat(detail?.amount) || 0;
        const receivedAmount = detail?.received.map((receive) => {
            const payment = parseInt(receive.amount);
            return payment || parseInt(receive.amount);
        })
        const received = receivedAmount?.reduce(total,0);
        console.log('amount:', amount)
        console.log('received:', received)
        const payment = amount - received;

        // Check if payment is a valid number
        if (!isNaN(payment) && isFinite(payment)) {
            // Set dueAmount to a positive value or 0
            detail.due = Math.max(0, payment.toFixed(2));
        } else {
            detail.due = null;
        }
        console.log('due:', detail.due)
    })


    const TotalAmount = PaymentDetails.map((detail) => {
        return detail.amount;
    });
    console.log('TotalAmount:', TotalAmount)
    this.totalValue = TotalAmount.reduce(total)
    // console.log('totalValue:', this.totalValue)

    const amount = parseFloat(this.totalValue) || 0;
    const paidAmount = PaymentDetails.map((detail) => {
        return detail?.received.map((receive) => {
            return parseInt(receive.amount);
        })
    })
    const received = paidAmount.reduce(total) || 0;
    console.log('Totalamount:', amount)
    console.log('Totalpaid:', paidAmount)
    console.log('Totalreceived:', received)
    const payment = amount - received;

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
