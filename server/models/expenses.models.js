const mongoose = require('mongoose');

const expensesSchema = new mongoose.Schema({
    site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    amount:{
        type: Date,
        required: true,
    },
    purpose:{
        type: String,
        required: true,
    }
},{timestamps:true});

const Expenses = mongoose.model('Expenses', expensesSchema);
module.exports = Expenses;