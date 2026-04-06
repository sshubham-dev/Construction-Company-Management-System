const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      // required: true,
    },
    costCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
      default: null,
    },
    clientLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    receivedInto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    purpose: String,
    medium: String,
    referenceNo: String,
    narration: String,

    proofImage: {
      secure_url: String,
      public_id: String,
    }, // file path

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Collection", collectionSchema);
