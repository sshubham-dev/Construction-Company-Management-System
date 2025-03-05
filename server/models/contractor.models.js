const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: Number,
        required: true,
    },
    whatsapp: {
        type: Number,
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
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
    }],
    site: [{
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        }
    }],
    workOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work-Order'
    }],
}, { timestamps: true })

const Contractor = mongoose.model('Contractor', contractorSchema);
module.exports = Contractor;