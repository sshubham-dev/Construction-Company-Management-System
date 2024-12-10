const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    userMail: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        min: 8,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        required: true,
    },
    whatsapp: {
        type: String,
    },
    role: {
        type: String,
        enum: ['Admin', 'Client', 'Employee', 'Supplier', 'Contractor'],
        default: null,
    },
    department: {
        type: String,
        enum: ['Admin', 'Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head'],
        default: null,
    },
    avatar: {
        type:String,
    },
    refreshToken: String,
    approved:[{
        type:mongoose.Schema.Types.ObjectId,
    }],
    attendance:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Attendance'
    }],
    leave:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Leave'
    }],
    pending:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pending-Approval',
    }],
    rejected:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rejected-Items'
    }],
    deleted:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deleted-Items'
    }],
    draft:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Draft-Items'
    }],
    task:[{
        type: mongoose.Schema.Types.ObjectId,
    }],
    // message: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Message'
    // }],
    message: [{
        type: String,
    }],
    account: [{
        type: String,
        date: Date,
    }],
    site: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
    }],
},
    { timestamps: true });

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    try {
        console.log('NewPasswd', user.password)
        const hash_password = await bcrypt.hash(user.password, 12);
        user.password = hash_password;
        console.log('hash_password', hash_password)
    } catch (error) {
        next(error);
    }
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', userSchema);
module.exports = User;