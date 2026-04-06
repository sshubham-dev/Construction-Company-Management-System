const mongoose = require("mongoose");

const invoiceAllocationSchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["PAYMENT", "RECEIPT"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvoiceAllocation", invoiceAllocationSchema);