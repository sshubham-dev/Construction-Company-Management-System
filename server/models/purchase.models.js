const mongoose = require("mongoose");

/* =========================
   ITEM SUBDOC
========================= */
const purchaseItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },

  quantity: Number,
  rate: Number,

  amount: Number,

  taxRate: {
    type: Number,
    default: 0,
  },

  taxAmount: {
    type: Number,
    default: 0,
  },
});

/* =========================
   JOURNAL ENTRY
========================= */
const entrySchema = new mongoose.Schema({
  ledgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ledger",
    required: true,
  },

  type: {
    type: String,
    enum: ["DEBIT", "CREDIT"],
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },
});

/* =========================
   MAIN SCHEMA
========================= */
const purchaseVoucherSchema = new mongoose.Schema(
{
  voucherNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  supplierLedgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ledger",
    required: true,
  },

  grnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GRN",
    required: true,
    unique: true, // 🔥 prevent duplicate
  },

  items: [purchaseItemSchema],

  totalAmount: Number,
  taxAmount: Number,
  netAmount: Number,

  purchaseLedgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ledger",
    required: true,
  },

  entries: [entrySchema], // 🔥 accounting core

  status: {
    type: String,
    enum: ["DRAFT", "POSTED", "CANCELLED"],
    default: "DRAFT",
  },

  narration: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
},
{ timestamps: true }
);
  
purchaseVoucherSchema.pre("validate", function (next) {
  if (!this.items || !this.items.length) {
    return next(new Error("Items required"));
  }

  let total = 0;
  let tax = 0;

  this.items.forEach((item) => {
    item.amount = item.quantity * item.rate;

    item.taxAmount = (item.amount * (item.taxRate || 0)) / 100;

    total += item.amount;
    tax += item.taxAmount;
  });

  this.totalAmount = total;
  this.taxAmount = tax;
  this.netAmount = total + tax;

  next();
});


const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;
