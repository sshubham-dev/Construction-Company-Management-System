const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
    },
    site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    unit: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    value: {
        type: Number,
        required: true,
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
}, { timeseries: true });

const Sale = mongoose.model('Sale', saleSchema);