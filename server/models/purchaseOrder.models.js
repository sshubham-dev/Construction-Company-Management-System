const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    material: {
        type: String,
    },
    rate: {
        type: Number,
    },
    quantity: {
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
    slip: {
        type: String,
        content: String,
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
    approvalStatus: {
        type: String,
        default: 'Pending'
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
}, { timestamps: true });

purchaseOrderSchema.pre('save', function (next) {
    const items = this.requirement;
    items.map((item) => {
        const amount = parseFloat(item.amount) || 0;
        const paid = parseFloat(item.paid) || 0;
        console.log('amount:', amount)
        console.log('paid:', paid)
        const payment = amount - paid;
        if (!isNaN(payment) && isFinite(payment)) {
            item.due = Math.max(0, payment.toFixed(2));
            console.log('due:', item.due)
        } else {
            item.due = null;
        }
    })

    function total(amount, value) {
        return amount + value
    };
    const TotalAmount = items.map((item) => {
        return item.amount;
    });
    const TotalPaid = items.map((item) => {
        return item.paid;
    });
    console.log('TotalAmountworkOrder:', TotalAmount)
    this.totalValue = TotalAmount.reduce(total)
    this.totalPaid = TotalPaid.reduce(total)
    console.log('totalValue:', this.totalValue)

    const amount = parseFloat(this.totalValue) || 0;
    const paidAmount = parseFloat(this.totalPaid) || 0;
    console.log('TotalamountworkOrder:', amount)
    console.log('TotalpaidworkOrder:', paidAmount)
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