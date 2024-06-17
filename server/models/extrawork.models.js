const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
    work:{
        type:String,
        required:true,
    },
    unit:{
        type:String,
    },
    rate:{
        type:Number,
    },
    area:{
        type:Number,
    },
    amount:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    status:{
        type: String,
        default: 'Pending',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    paymentStatus: {
        type: String,
        default: 'Pending',
    },
    clientApprove: {
        type: String,
        default: 'Pending'
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    contractorApprove:{
        type: String,
        default:'Pending'
    },
})

const extraWorkSchema = new mongoose.Schema({
    extraFor:{
        type:String,
        default: null,
    },
    site:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Site',
    },
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Client',
    },
    contractor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contractor',
    },
    WorkDetail:[workSchema],
    totalAmount:{
        type: String,
    },
    paid:{
        type:String,
    },
    due:{
        type:String,
    }
},
    {timestamps:true});

const ExtraWork = mongoose.model('Extra-Work', extraWorkSchema);
module.exports = ExtraWork;