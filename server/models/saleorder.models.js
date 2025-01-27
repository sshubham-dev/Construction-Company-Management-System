const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
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
        required: true
    },
    deliveryDate: {
        type: Date
    },
    items: [{
        item: {
            name: String,
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Stock',
                required: true,
            }
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    totalPaid: {
        type: Number,
        required: true,
    },
    totalDue: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
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
}, { timeseries: true });

const SalesOrder = mongoose.model('SalesOrder', salesSchema);
module.exports = SalesOrder;