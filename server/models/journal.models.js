const mongoose = require('mongoose');

// Schema for journal entries
const journalEntrySchema = new mongoose.Schema({
    account: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account', // Reference to the Account model
            required: true,
        }
    },
    debit: {
        type: Number,
        default: 0, // Amount to be debited
    },
    credit: {
        type: Number,
        default: 0, // Amount to be credited
    },
    description: {
        type: String,
        required: true, // Description of the transaction
    },
    date: {
        type: Date,
        required: true, // Date of the entry
    },
});

const journalSchema = new mongoose.Schema({
    voucherNo: {
        type: String,
        required: true, // Unique voucher number
    },
    date: {
        type: Date,
        required: true, // Date of the voucher
    },
    narration: {
        type: String,
        required: true, // Narration/Description of the voucher
    },
    entries: [journalEntrySchema], // Array of journal entries
    totalDebit: {
        type: Number,
        required: true
    }, // Sum of all debit amounts
    totalCredit: {
        type: Number,
        required: true
    }, // Sum of all credit amounts
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, // User who created the journal entry
}, { timestamps: true });

journalSchema.pre('save', function (next) {
    const totalDebit = this.entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = this.entries.reduce((sum, entry) => sum + entry.credit, 0);

    if (totalDebit !== totalCredit) {
        return next(new Error('Total debit and credit amounts must be equal.'));
    }

    this.totalDebit = totalDebit;
    this.totalCredit = totalCredit;
    next();
});

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;


const stockJournalSchema = new mongoose.Schema({
  voucherNumber: { type: String, required: true, unique: true }, // Unique identifier for the stock journal
  date: { type: Date, required: true }, // Date of the stock journal entry
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true }, // Reference to the ItemMaster model
    quantity: { type: Number, required: true }, // Quantity of stock to be adjusted
    rate: { type: Number, required: true }, // Unit price of the item
    amount: { type: Number, required: true }, // Total amount (quantity * rate)
    adjustmentType: { type: String, required: true, enum: ['Increase', 'Decrease'] }, // Type of adjustment (increase or decrease)
    reason: { type: String }, // Reason for the adjustment (e.g., stock write-off, error correction)
  }],
  totalAmount: { type: Number, required: true }, // Total amount for the stock journal entry
  narration: { type: String }, // Optional remarks or description
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who created the voucher
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

stockJournalSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
    next();
  });
  

const StockJournal = mongoose.model('StockJournal', stockJournalSchema);
module.exports = StockJournal;
