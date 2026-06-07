// utils/voucherNoGenerator.js
const Voucher = require("../models/voucher.models");
const VoucherCounter = require("../models/voucherCounter.models");
const { getFinancialYear } = require("./getFinancialYear");

const TYPE_PREFIX = {
  JOURNAL: "JRNL",
  PAYMENT: "PAY",
  RECEIPT: "RCP",
  CONTRA: "CNT",
  PURCHASE: "PUR",
  SALES: "SAL",
};

exports.generateVoucherNo = async ({ companyId, type, fy }) => {
  if (!companyId || !type || !fy) {
    throw new Error("companyId, type, and fy required");
  }

  // 🔥 atomic increment (no race condition)
  const counter = await VoucherCounter.findOneAndUpdate(
    { companyId, type, fy },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const prefix = TYPE_PREFIX[type] || "VCH";

  return `${prefix}-${fy}-${String(counter.seq).padStart(5, "0")}`;
};


exports.rebuildVoucherNumbers = async ({ companyId, type, fy }) => {

  await VoucherCounter.deleteMany({ companyId, type, fy });

  const vouchers = await Voucher.find({ companyId, type, fy })
    .sort({ date: 1 });

  for (const voucher of vouchers) {
    const fy = getFinancialYear(voucher.date);
    const voucherNo = await generateVoucherNo({
      companyId: voucher.companyId,
      type: voucher.type,
      fy: fy.code,
    });

    voucher.voucherNo = voucherNo;
    voucher.fy = fy.code;

    await voucher.save();
  }

  console.log(
    `Updated ${vouchers.length} vouchers`
  );
}
