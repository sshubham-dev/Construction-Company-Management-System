const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    voucherNo: {
      type: String,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    from: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
    },
    to: {
      name: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
    },
    referenceNo: {
      type: String, // Optional bank transaction reference for online receipts
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    description: {
      type: String,
      required: true,
    },
    counterPartyLabel: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },

    voucherType: {
      type: String,
      default: "Receipt",
    },

    invoice: [
      {
        invoiceId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        invoiceType: {
          type: String,
        },
        amount: Number,
      },
    ],

    costCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
    },
    postedAt: Date,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Receipt = mongoose.model("Receipt", receiptSchema);

module.exports = Receipt;
