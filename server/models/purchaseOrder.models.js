const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
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
    site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
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
    accountApprove: {
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
        required: true,
        enum: ['Due', 'Paid'],
    },
    paymentMode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
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

const PurchaseOrder = mongoose.model('Purchase-Order', purchaseOrderSchema);
module.exports = PurchaseOrder;