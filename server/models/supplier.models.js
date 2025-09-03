const mongoose = require('mongoose');
const { syncLedger } = require('../utils/ledgerSync');

const deliveryRecordSchema = new mongoose.Schema({
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase_Order',
    },
    site: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        },
    },
    items: [{
        name: String,
        quantity: Number,
        rate: Number,
        amount: Number,
        unit: String,
    }],
    deliveryDate: Date,
    remarks: String,
});

const supplierSchema = new mongoose.Schema({
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
        type: Number
    },
    address: {
        type: String,
        // street: String,
        // city: String,
        // district: String,
        // state: String,
    },
    gstNo: {
        type: String,
    },
    bank: {
        type: String,
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    jobWork: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isUser: Boolean,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    purchaseOrder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase_Order',
    }],
    ledger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger',
    },
    deliveries: [deliveryRecordSchema], // ← From Purchase Orders
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
    }],
    totalSupplied: {
        type: Number,
        default: 0,
    },
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
        enum: ['Active', 'Inactive', 'Blacklisted'],
    }
}, { timestamps: true })

supplierSchema.pre('save', async function (next) {
  try {
    const ledgerId = await syncLedger({
      doc: this,
      type: 'Supplier',
      fieldsToWatch: ['name', 'gstNo', 'address', 'email', 'phone', 'whatsapp'],
      under: 'Sundry Creditors',
      getAddress: (doc) => ({
        name: doc.name,
        address: doc.address,
      }),
      getTaxDetails: (doc) => ({
        gstNo: doc.gstNo || ''
      }),
    });
    this.ledger = ledgerId;
    next();
  } catch (err) {
    console.error('Error in supplier ledger sync:', err);
    next(err);
  }
});


const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;