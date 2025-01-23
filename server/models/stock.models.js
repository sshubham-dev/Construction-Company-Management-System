const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    code:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    category:{
        type:String,
    },
    unit:{
        type: String,
        required: true,
    },
    rate:{
        type: Number,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    quantity:{
        type:Number,
        required: true,
    },
    stockValue:{
        type: Number,
        required: true,
    },
    purchase:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Purchase',
    }],
    sales:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
    }],
    profit:{
        type: Number,
    }
}, { timestamps: true });

const Stock = mongoose.model('Stock', stockSchema);
module.exports = Stock;