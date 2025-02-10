const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
    grnNo:{
        type: String,
    },
    clientDetails: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'lead'
        },
        address: String,
        plotDetail: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    workDetails: [{
        workDescription: {
            type: String,
        },
        unit: String,
        area: Number,
        actualArea: Number,
        rate: Number,
        amount: Number,
    }],
    totalValue: {
        type: String,
    },
    itemsDetails: [{
        itemTitle: {
            type: String,
        },
        item: [{
            type: String,
        }],
    }],
    terms:[{
        type: String,
    }],
}, { timestamps: true });

const Agreement = mongoose.model("Agreement", agreementSchema);
module.exports = Agreement;