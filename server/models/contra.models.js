const mongoose = require("mongoose");

const contraSchema = new mongoose.Schema(
  {
    voucherNo: {
      type: String,
      required: true,
      unique: true,
    }, // Unique identifier for the Contra voucher
    date: {
      type: Date,
      required: true,
    }, // Transaction date
    from: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
      name: String,
    },
    to: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
      name: String,
    },
    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },
    voucherType: {
      type: String,
      default: "Contra",
    },

    amount: {
      type: Number,
      required: true,
    }, // Transfer amount
    description: {
      type: String,
    }, // Optional narration/remarks
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // User who created the voucher
  },
  { timestamps: true }
);

const Contra = mongoose.model("Contra", contraSchema);
module.exports = Contra;
