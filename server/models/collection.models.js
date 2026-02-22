const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Collection",
  collectionSchema
);
