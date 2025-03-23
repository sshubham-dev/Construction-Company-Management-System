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
    deliveryDate:{
        type: Date,
        required: true
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
        unit: String,
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
    },
    taxAmount: { 
        type: Number
    },
    grandTotal: { 
        type: Number
    },
    totalPaid: {
        type: Number,
    },
    totalDue: {
        type: Number,
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
            ref: 'Ledger',
        }
    },
    purchaseRequest: {
        type: String
    },
}, { timeseries: true });




const SalesOrder = mongoose.model('Sales_Order', salesSchema);
module.exports = SalesOrder;