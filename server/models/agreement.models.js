const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Client',
    },
    clientDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer',
    },
    date:{
        type:Date,
        default:Date.now,
    },
    workDetails:[{
        workDescription: {
            type:String,
        },
        unit: String,
        area: Number,
        rate: Number,
        amount: Number,
    }],
    totalValue:{
        type:String,
    },
    itemsDetails:[{
        itemTitle:{
            type:String,
        },
        item:[{
            type:String,
        }],
    }],
    site:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Site',
    }
},{timestamps:true});

const Agreement = mongoose.model("Agreement", agreementSchema);
module.exports = Agreement;