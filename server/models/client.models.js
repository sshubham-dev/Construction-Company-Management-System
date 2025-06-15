const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
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
        street: String,
        city: String,
        district: String,
        state: String,
    },
    site: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        }
    },
    gstNo: {
        type: String,
    },
    isUser: Boolean,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    extraWork: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extra_Work',
    }],
    agreement: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agreement'
        },
        totalValue: Number,
    },
    account: {
        receivable: {
            type: Number,
        },
        received: {
            type: Number,
        },
        expenses: {
            type: Number,
        },
        balance: {
            type: Number,
        },
    },
    ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger'
    }
}, { timestamps: true });

clientSchema.pre('save', function (next) {
    const totalValue = this.agreement.totalValue;
    this.receivable = totalValue || 0;
    next()
})

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;