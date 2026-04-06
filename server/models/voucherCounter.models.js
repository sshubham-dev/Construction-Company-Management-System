// models/voucherCounter.model.js

const mongoose = require("mongoose");

const voucherCounterSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
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
});

voucherCounterSchema.index(
  { companyId: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "VoucherCounter",
  voucherCounterSchema
);