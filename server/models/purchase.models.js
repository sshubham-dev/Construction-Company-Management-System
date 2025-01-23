const mongoose = require('mongoose');


const purchaseSchema = new mongoose.Schema({
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
    },
    supplier:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Supplier',
    },
    date:{
        type:Date,
        default:Date.now(),
    },
    unit:{
        type: String,
        required: true,
    },
    quantity:{
        type:Number,
        required: true,
    },
    price:{
        type:Number,
        required: true,
    },
    value:{
        type: Number,
        required: true,
    },
    paid:{
        type: Number,
        required: true,
    },
    due:{
        type: Number,
        required: true,
    },
    paymentStatus:{
        type: String,
        required: true,
        enum:['Due', 'Paid'],
    },
    paymentMode:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }
},{timestamps: true});

const Purchase = mongoose.model('Purchase', purchaseSchema);