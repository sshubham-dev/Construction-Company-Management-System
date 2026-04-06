const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    ledgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
      index: true,
    },

    debit: {
      type: Number,
      default: 0,
    },

    credit: {
      type: Number,
      default: 0,
    },

    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
      index: true,
    },

    voucherType: {
      type: String,
      required: true,
    },

    narration: String,
  },
  { timestamps: true }
);

const LedgerEntry = mongoose.model("LedgerEntry", ledgerEntrySchema);
module.exports = LedgerEntry