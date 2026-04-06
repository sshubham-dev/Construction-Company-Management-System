const mongoose = require("mongoose");

// Schema for journal entries
const journalEntrySchema = new mongoose.Schema({
  account: {
    name: String,
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },
  },
  type: {
    type: String,
    enum: ["Debit", "Credit"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reference: String,
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "reference",
  },
});

const journalSchema = new mongoose.Schema(
  {
    voucherNo: { type: String, required: true, unique: true },
    narration: String,
    entries: [journalEntrySchema],
    totalDebit: Number,
    totalCredit: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },
    costCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
    },
  },
  { timestamps: true }
);


journalSchema.pre("save", function () {
  let debit = 0,
    credit = 0;

  for (let entry of this.entries) {
    if (entry.type === "Debit") debit += entry.amount;
    else if (entry.type === "Credit") credit += entry.amount;
  }

  if (debit !== credit) {
    return new Error("Total debit and credit must be equal.");
  }

  this.totalDebit = debit;
  this.totalCredit = credit;
});

const Journal = mongoose.model("Journal", journalSchema);

const stockJournalSchema = new mongoose.Schema({
  voucherNumber: { type: String, required: true, unique: true }, // Unique identifier for the stock journal
  date: { type: Date, required: true }, // Date of the stock journal entry
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
        required: true,
      }, // Reference to the ItemMaster model
      quantity: { type: Number, required: true }, // Quantity of stock to be adjusted
      rate: { type: Number, required: true }, // Unit price of the item
      amount: { type: Number, required: true }, // Total amount (quantity * rate)
      adjustmentType: {
        type: String,
        required: true,
        enum: ["Increase", "Decrease"],
      }, // Type of adjustment (increase or decrease)
      reason: { type: String }, // Reason for the adjustment (e.g., stock write-off, error correction)
    },
  ],
  totalAmount: { type: Number, required: true }, // Total amount for the stock journal entry
  narration: { type: String }, // Optional remarks or description
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who created the voucher
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

stockJournalSchema.pre("save", function () {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
});

const StockJournal = mongoose.model("Stock_Journal", stockJournalSchema);

module.exports = { Journal, StockJournal };
