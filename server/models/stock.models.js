const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    code: {
        type: String,
        // required: true,
        // unique: true,
        trim: true,
    },
    category: {
        type: String,
        // id: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Stock_Group',
        //     required: true,
        // }
    },
    unit: [{
        type: String,
    }],
    rate: {
        type: Number,
    },
    price: {
        type: Number,
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
    },
    status: {
        type: String,
        enum: ['In Stock', 'Out Of Stock', 'Low Stock'],
    },
    typeOfSupply: {
        type: String,
        enum: ['Goods', 'Services', 'Capital Goods'],
    },
    valuationMethod: {
        type: String,
        enum: ['FIFO', 'LIFO', 'Weighted Average'],
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


const stockGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        // required: true,
        // unique: true,
        trim: true,
    },
    unit: [{
        type: String,
    }],
    item: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
        }
    }],
    profit: {
        type: Number,
    }
}, { timestamps: true });

const Stock_Group = mongoose.model('StockGroup', stockGroupSchema);
module.exports = { Stock, Stock_Group };


