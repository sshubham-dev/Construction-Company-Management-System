const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name:{
        type:String,
        required:true,
        trim: true,
    },
    email:{
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    contactNo: {
        type: Number,
        required: true,
    },
    whatsapp: {
        type: Number,
    },
    address: {
        street: String,
        city: String,
        district: String,
        state: String,
    },
    site:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Site',
    },
    gstNo:{
        type:String,
    },
    extraWork: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extra-Work',
    }],
},{timestamps:true})

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;