const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
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
    employeeNo: {
        type: String,
        unique: true,
        index: true
    },
    gender: String,
    address: {
        type: String,
    },
    addhar: {
        type: String,
    },
    pan: {
        type: String,
    },
    cv: {
        type: String,
    },
    offerletter: {
        type: String,
    },
    bank: {
        type: String,
    },
    isUser: {
        type: Boolean,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    certificates: {
        type: [{
            type: String,
        }],
    },
    joinDate: {
        type: Date,
        default: Date.now,
    },
    department: {
        type: String,
    },
    birthdate: {
        type: Date,
    },
    salary: {
        type: Number,
    },
    salarySlip: [{
        type: String,
        content: String
    }],
    pf: {
        type: String,
    },
    esi: {
        type: String,
    },
    uan: {
        type: String,
    },
    taxRegime: String,
    ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger'
    },
    account: {
        payable: {
            type: Number,
        },
        paid: {
            type: Number,
        },
        expenses: {
            type: Number,
        },
        balance: {
            type: Number,
        },
    },
}, { timestamps: true })


const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;