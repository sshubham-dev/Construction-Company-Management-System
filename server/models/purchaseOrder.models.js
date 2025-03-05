const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    item: {
        type: String,
    },
    unit: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    rate: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
        default: 'Pending',
    },
}, { timestamps: true });

const purchaseOrderSchema = new mongoose.Schema({
    orderNo: {
        type: String,
        required: true,
        unique: true
    },
    site: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        }
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    deliveredDate: {
        type: Date
    },
    supplier: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    requirement: [requirementSchema],
    supplierApprove: {
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
    bill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
    }],
    slip: {
        type: String,
        content: String,
    },
    totalPaid: {
        type: Number,
    },
    totalDue: {
        type: Number,
    },
    totalValue: {
        type: Number,
    },
    paymentStatus: {
        type: String,
        default: 'Due',
        enum: ['Due', 'Paid'],
    },
    paymentMode: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        }
    }
}, { timestamps: true });

purchaseOrderSchema.pre('save', function (next) {
    const items = this.requirement;
    function total(amount, value) {
        return amount + value
    };
    const TotalAmount = items.map((item) => {
        return item.amount;
    });
    const TotalPaid = items.map((item) => {
        return item.paid;
    });
    console.log('TotalOrder:', TotalAmount)
    this.totalValue = TotalAmount.reduce(total)
    this.totalPaid = TotalPaid.reduce(total)
    console.log('totalValue:', this.totalValue)

    const amount = parseFloat(this.totalValue) || 0;
    const paidAmount = parseFloat(this.totalPaid) || 0;
    console.log('TotalOrder:', amount)
    console.log('TotalpaidOrder:', paidAmount)
    const payment = amount - paidAmount;

    if (!isNaN(payment) && isFinite(payment)) {
        this.totalDue = Math.max(0, payment.toFixed(2));
    } else {
        this.totalDue = null;
    }
    next();
});

const Purchase_Order = mongoose.model('Purchase_Order', purchaseOrderSchema);
module.exports = Purchase_Order;


