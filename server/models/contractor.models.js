const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contactNo: {
        type: Number,
        required: true,
    },
    whatsapp: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
    },
    addhar: {
        type: String,
    },
    pan: {
        type: String,
    },
    bank: {
        type: String,
    },
    jobWork: {
        type: String,
    },
    isUser: Boolean,
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    checklist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checklist',
    }],
    extraWork: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extra-Work',
    }],
    bill: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
        required: true
    }],
    site: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
    }],
    workOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work-Order'
    }],
}, { timestamps: true })

const Contractor = mongoose.model('Contractor', contractorSchema);
module.exports = Contractor;