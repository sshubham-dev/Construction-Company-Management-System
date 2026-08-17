// models/voucherCounter.model.js

const mongoose = require("mongoose");

const voucherCounterSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    fy: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
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

voucherCounterSchema.index({ fy: 1, type: 1, companyId: 1 }, { unique: true })

module.exports = mongoose.model(
  "VoucherCounter",
  voucherCounterSchema
);