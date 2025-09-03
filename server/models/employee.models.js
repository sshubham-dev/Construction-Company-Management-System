const mongoose = require('mongoose');
const { syncLedger } = require('../utils/ledgerSync');

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
        //         street: String,
        // city: String,
        // district: String,
        // state: String,
    },
    addhar: {
        type: String,
    },
    panNo: {
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
    // Ledger Mapping
    ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger',
    },
    // Salary Transactions
    salaryHistory: [{
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
        },
        amount: Number,
        date: Date,
        month: String, // e.g., "May 2025"
        remarks: String,
    }],
    // Advances & Bonus
    advances: [{
        amount: Number,
        date: Date,
        reason: String,
    }],
    bonus: [{
        amount: Number,
        date: Date,
        reason: String,
    }],
    // Deductions
    deductions: [{
        amount: Number,
        date: Date,
        reason: String,
    }],
    // Payroll Summary
    totalPaid: {
        type: Number,
        default: 0,
    },
    totalDue: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        default: 'Active',
        enum: ['Active', 'Inactive', 'Resigned'],
    }
}, { timestamps: true })

employeeSchema.pre('save', async function (next) {
    try {
        console.log('>> employeeSchema.pre save triggered for', this.name);

        const ledgerId = await syncLedger({
            doc: this,
            type: 'Employee',
            fieldsToWatch: ['name', 'panNo', 'address', 'email', 'phone', 'whatsapp'],
            under: 'Salaries Payable',
            getAddress: (doc) => ({
                name: doc.name,
                address: doc.address,

            }),
            getTaxDetails: (doc) => ({
                panNo: doc.panNo || '',
            }),
        });
 if (ledgerId) this.ledger = ledgerId;
        next();
    } catch (err) {
        console.error('Error in employee ledger sync:', err);
        next(err);
    }
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;