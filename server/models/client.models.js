const mongoose = require('mongoose');
const { syncLedger } = require('../utils/ledgerSync');

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
    ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger',
    },
    receipts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Receipt'
    }],
    payable: {
        type: Number,
        default: 0
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    totalDue: {
        type: Number,
        default: 0
    },
    account: {
        paid: Number,
        due: Number,
        advance: Number,
    },
    status: {
        type: String,
        default: 'Active',
        enum: ['Active', 'Inactive', 'Blacklisted'],
    }

}, { timestamps: true });


clientSchema.pre('save', async function (next) {
    try {
        const totalValue = this.agreement.totalValue;
        this.payable = totalValue || 0;

        const ledgerId = await syncLedger({
            doc: this,
            type: 'Client',
            fieldsToWatch: ['name', 'phone', 'whatsapp', 'gstNo', 'address', 'email'],
            under: 'Sundry Debtors',
            getAddress: (doc) => ({
                name: doc.name,
                address: [
                    doc.address?.street,
                    doc.address?.city,
                    doc.address?.district
                ].filter(Boolean).join(', '),
                state: doc.address?.state || ''
            }),
            getTaxDetails: (doc) => ({
                gstNo: doc.gstNo || ''
            }),
        });
        if (ledgerId) this.ledger = ledgerId;
        next();
    } catch (err) {
        console.error('Error in client ledger sync:', err);
        next(err);
    }
});


const Client = mongoose.model('Client', clientSchema);
module.exports = Client;