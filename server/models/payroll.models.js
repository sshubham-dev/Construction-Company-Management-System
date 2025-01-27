const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    salaryMonth: {
        type: String,
        required: true
    },  // E.g., 'January', 'February', etc.
    basicSalary: {
        type: Number,
        required: true
    },
    bonuses: {
        type: Number,
        default: 0
    },
    deductions: [{
        type: {
            type: String,
            enum: ['Tax', 'Insurance', 'Loan', 'Other'],
            required: true
        }, // Type of deduction
        amount: {
            type: Number,
            required: true,
            default: 0
        }, // Deduction amount
        description: {
            type: String
        }, // Optional description for the deduction
    }],
    netSalary: {
        type: Number,
        required: true
    }, // Final salary after deductions
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Pending'
    },
    paymentDate: { type: Date },
}, { timestamps: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
module.exports = Payroll;

payrollSchema.pre('save', function (next) {
    // Calculate the net salary: basic salary + bonuses - total deductions
    const totalDeductions = this.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    this.netSalary = this.basicSalary + this.bonuses - totalDeductions;
    next();
});


const deductionSchema = new mongoose.Schema({
    name: { type: String, required: true },  // E.g., "Tax", "Provident Fund"
    percentage: { type: Number, required: true },  // Percentage of the salary to deduct
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Deduction = mongoose.model('Deduction', deductionSchema);
module.exports = Deduction;


const bonusSchema = new mongoose.Schema({
    name: { type: String, required: true },  // E.g., "Annual Bonus"
    amount: { type: Number, required: true },  // Fixed amount or calculated value
    percentage: { type: Number },  // If applicable
    eligibleEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Bonus = mongoose.model('Bonus', bonusSchema);
module.exports = Bonus;


const paymentHistorySchema = new mongoose.Schema({
    payroll: { type: mongoose.Schema.Types.ObjectId, ref: 'Payroll', required: true },
    paymentAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Bank Transfer', 'Cash', 'Cheque'], required: true },
    paymentDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);
module.exports = PaymentHistory;


const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
    taxType: { type: String, enum: ['Income Tax', 'Other Tax'], required: true },
    salaryRange: { type: String, required: true },  // E.g., "Up to 5,000", "5,000 to 10,000", etc.
    taxRate: { type: Number, required: true },  // Tax percentage for the range
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Tax = mongoose.model('Tax', taxSchema);
module.exports = Tax;
