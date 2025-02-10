const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: Date,
    contact: {
        phoneNo: String,
        whatsapp: String,
        email: String,
    },
    location:{
        address: String,
        city: String,
        district: String,
        state: String,
    },
    leadStatus:{
        type: String,
        default: 'active',
        enum:['active', 'closed']
    },
    status: {
        type: String,
        default:'lead',
        enum:['customer', 'lead', 'irrelevent', 'client'],
    },
    requirement:{
        service: {
            type: String,
        },
        message: String,
    },
    followUps:[{
        followUpNo: String,
        date: Date,
        message: String,
    }],
    source: {
        type: String,
    },
    contactAgent:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    quotation:{
        type:String,
    },
    isClient: Boolean,
}, { timestamps: true })

const Lead = mongoose.model('Lead', leadSchema)

module.exports = Lead;