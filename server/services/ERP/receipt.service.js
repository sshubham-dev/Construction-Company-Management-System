const Voucher = require("../../models/voucher.models");
const { Ledger } = require("../../models/ledger.models");
const InvoiceAllocation = require("../../models/invoiceAllocation.models");
const { getVouchers } = require("./voucher/query.service");
const { generateVoucherNo, rebuildVoucherNumbers } = require("../../utils/voucherNoGenerator");
const getFinancialYear = require("../../utils/getFinancialYear");


/* ======================
   CREATE
====================== */
// ✅
async function createReceiptVoucher(data, user) {
  const {
    date,
    costCenterId,
    from, // client
    to, // bank/cash
    amount,
    narration,
  } = data;

  if (!date) throw Error("Date required");

  if (!from || !to || !amount) {
    throw new Error("Missing required fields");
  }

  if (from === to) {
    throw new Error("From and To ledger cannot be same");
  }

  const partyLedger = await Ledger.findById(from);
  const bankLedger = await Ledger.findById(to);

  if (!partyLedger || !bankLedger) {
    throw new Error("Ledger not found");
  }

  /* ======================
     ENTRIES
  ====================== */

  const entries = [
    { ledgerId: bankLedger._id, type: "DEBIT", amount },
    { ledgerId: partyLedger._id, type: "CREDIT", amount },
  ];

  const fy = getFinancialYear(date);

  const voucherNo = await generateVoucherNo({
    companyId: user.companyId,
    type: "RECEIPT",
    fy: fy.code,
  });

  const voucher = await Voucher.create({
    voucherNo,
    type: "RECEIPT",
    date,
    fy: fy.code,
    entries,
    paidBy: "CLIENT",
    narration,
    costCenterId: costCenterId || null,
    status: "DRAFT",
    companyId: user.companyId,
    createdBy: user._id,
  });

  return voucher;
}

// ✅
async function updateReceiptVoucher(id, data) {
  const voucher = await Voucher.findById(id);

  if (!voucher) {
    throw new Error("Voucher not found");
  }

  if (voucher.status !== "DRAFT") {
    throw new Error("Only Draft voucher can be updated");
  }

  const {
    from,
    to,
    amount,
    narration,
    date,
    costCenterId,
  } = data;

  const fy = getFinancialYear(date);

  // Prevent FY change
  if (voucher.fy !== fy.code) {
    // throw new Error(
    //   `Voucher belongs to FY ${voucher.fy}. Financial Year cannot be changed.`
    // );
    voucher.fy = fy.code;
  }

  voucher.entries = [
    {
      ledgerId: to,
      type: "DEBIT",
      amount: Number(amount),
    },
    {
      ledgerId: from,
      type: "CREDIT",
      amount: Number(amount),
    },
  ];
  voucher.narration = narration;
  voucher.date = date;
  voucher.costCenterId = costCenterId || null;

  await voucher.save();

  return voucher;
}

// ✅
async function getAllReceipts(query) {
  const result = await getVouchers("RECEIPT", query);
  return result;
}

// ✅
async function getReceiptById(id) {
  const voucher = await Voucher.findById(id).populate("entries.ledgerId");

  const allocations = await InvoiceAllocation.find({ voucherId: id });

  return { voucher, allocations };
}

// ✅
async function deleteReceiptVoucher(id) {
  const voucher = await Voucher.findById(id);

  if (!voucher) throw new Error("Voucher not found");

  if (voucher.status !== "DRAFT") {
    throw new Error("Only Draft voucher can be deleted");
  }

  await voucher.deleteOne();

  // const fy = getFinancialYear(voucher.date);
  // await rebuildVoucherNumbers({
  //   companyId: voucher.companyId,
  //   type: voucher.type,
  //   fy: fy.code,
  // });

  return true;
}

module.exports = {
  createReceiptVoucher,
  updateReceiptVoucher,
  getAllReceipts,
  getReceiptById,
  deleteReceiptVoucher,
};
