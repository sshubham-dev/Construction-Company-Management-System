const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
    name: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 8
    },
    contactNo: {
        type: Number,
    },
    whatsapp: {
        type: Number,
        required: true,
    },
    employeeNo: {
        type: String,
        unique: true,
        index: true
    },
    gender:String,
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
    isUser: Boolean,
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
    pf:{
        type: String,
    },
    esi:{
        type: String,
    },
    uan:{
        type: String,
    },
    taxRegime: String,
}, { timestamps: true })

employeeSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;