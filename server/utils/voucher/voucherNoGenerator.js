// utils/voucherNoGenerator.js
const Voucher = require("../../models/voucher.models");
const VoucherCounter = require("../../models/voucherCounter.models");
const getFinancialYear = require("./getFinancialYear");

const TYPE_PREFIX = {
  JOURNAL: "JRNL",
  PAYMENT: "PAY",
  RECEIPT: "RCP",
  CONTRA: "CNT",
  PURCHASE: "PUR",
  SALES: "SAL",
  SALESINV: "SINV",
  PURCHASEINV:"PINV",
};

const generateVoucherNo = async ({
  companyId,
  type,
  fy,
}) => {

  const counter =
    await VoucherCounter.findOneAndUpdate(
      {
        companyId,
        type,
        fy,
      },
      {
        $inc: { seq: 1 },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

  const prefix =
    TYPE_PREFIX[type] || "VCH";

    console.log("Voucher No geenrated")
  return `${prefix}-${fy}-${String(
    counter.seq
  ).padStart(5, "0")}`;
};


const rebuildVoucherNumbers = async ({ companyId, type, fy }) => {

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

module.exports = {
  generateVoucherNo,
  rebuildVoucherNumbers
}