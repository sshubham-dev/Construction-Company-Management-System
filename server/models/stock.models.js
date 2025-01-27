const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    category: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock_Group',
            required: true,
        }
    },
    unit: [{
        name: String,
        required: true,
    }],
    rate: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    InStock: {
        type: Number,
    },
    actualQuantity: {
        type: Number
    },
    openingStock: {
        type: Number,
        default: 0
    },
    gstRate: {
        type: Number
    }, // GST percentage
    stockValue: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['In Stock', 'Out Of Stock', 'Low Stock'],
    },
    valuationMethod: {
        type: String,
        enum: ['FIFO', 'LIFO', 'Weighted Average'],
        required: true
    },
    purchaseOrder: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PurchaseOrder',
        }
    }],
    purchaseRequest: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PurchaseRequest',
        }
    }],
    salesOrder: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SalesOrder',
        }
    }],
    profit: {
        type: Number,
    }
}, { timestamps: true });

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;


const stockGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    unit: [{
        name: String,
        required: true,
    }],
    item: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
            required: true,
        }
    }],
    profit: {
        type: Number,
    }
}, { timestamps: true });

const Stock_Group = mongoose.model('StockGroup', stockGroupSchema);
module.exports = Stock_Group;


