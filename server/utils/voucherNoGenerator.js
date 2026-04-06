// utils/voucherNoGenerator.js

const VoucherCounter = require("../models/voucherCounter.models");

const TYPE_PREFIX = {
  JOURNAL: "JRNL",
  PAYMENT: "PAY",
  RECEIPT: "RCP",
  CONTRA: "CNT",
  PURCHASE: "PUR",
  SALES: "SAL",
};

exports.generateVoucherNo = async ({ companyId, type }) => {
  if (!companyId || !type) {
    throw new Error("companyId and type required");
  }

  // 🔥 atomic increment (no race condition)
  const counter = await VoucherCounter.findOneAndUpdate(
    { companyId, type },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const prefix = TYPE_PREFIX[type] || "VCH";

  return `${prefix}-${String(counter.seq).padStart(5, "0")}`;
};