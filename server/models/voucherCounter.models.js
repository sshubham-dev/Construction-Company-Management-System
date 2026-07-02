// models/voucherCounter.model.js

const mongoose = require("mongoose");

const voucherCounterSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },

    fy: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      required: true,
      unique: true,
    },

    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "VoucherCounter",
  voucherCounterSchema
);