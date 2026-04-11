const Voucher = require("../../models/voucher.models");
const { Ledger } = require("../../models/ledger.models");
const { getVouchers } = require("./voucher/query.service");
const { generateVoucherNo } = require("../../utils/voucherNoGenerator");

/* ======================
   CREATE
====================== */
// ✅
async function createContraVoucher(data, user) {
  const { date, from, to, amount, narration, costCenterId } = data;

  if (!from || !to || !amount) {
    throw new Error("Missing required fields");
  }

  if (from === to) {
    throw new Error("From and To ledger cannot be same");
  }

  const fromLedger = await Ledger.findById(from);
  const toLedger = await Ledger.findById(to);

  if (!fromLedger || !toLedger) {
    throw new Error("Ledger not found");
  }

  const entries = [
    {
      ledgerId: toLedger._id, // Debit
      type: "DEBIT",
      amount: Number(amount),
    },
    {
      ledgerId: fromLedger._id, // Credit
      type: "CREDIT",
      amount: Number(amount),
    },
  ];

  const voucherNo = await generateVoucherNo({
    companyId: user.companyId,
    type: "CONTRA",
  });

  const voucher = await Voucher.create({
    voucherNo,
    type: "CONTRA",
    date,
    entries,
    narration,
    costCenterId: costCenterId || null,
    status: "DRAFT",
    companyId: user.companyId,
    createdBy: user._id
  });

  return voucher;
}

/* ======================
   UPDATE (ONLY DRAFT)
====================== */
async function updateContraVoucher(id, data) {
  const voucher = await Voucher.findById(id);

  if (!voucher) throw new Error("Voucher not found");

  if (voucher.status !== "DRAFT") {
    throw new Error("Only Draft vouchers can be updated");
  }

  const { from, to, amount, narration, date, costCenterId } = data;

  if (from === to) {
    throw new Error("From and To ledger cannot be same");
  }

  const fromLedger = await Ledger.findById(from);
  const toLedger = await Ledger.findById(to);

  if (!fromLedger || !toLedger) {
    throw new Error("Ledger not found");
  }

  voucher.entries = [
    { ledgerId: toLedger._id, type: "DEBIT", amount },
    { ledgerId: fromLedger._id, type: "CREDIT", amount },
  ];

  voucher.narration = narration;
  voucher.date = date;
  voucher.costCenterId = costCenterId || null;

  await voucher.save();

  return voucher;
}

/* ======================
   DELETE (ONLY DRAFT)
====================== */
// ✅
async function deleteContraVoucher(id) {
  const voucher = await Voucher.findById(id);

  if (!voucher) throw new Error("Voucher not found");

  if (voucher.status !== "DRAFT") {
    throw new Error("Only Draft vouchers can be deleted");
  }

  await voucher.deleteOne();

  return true;
}

/* ======================
   GET ALL
====================== */
// ✅
async function getAllContras(query) {
  const result = await getVouchers("CONTRA", query);
  return result;
}

/* ======================
   GET ONE
====================== */
async function getContraById(id) {
  const voucher = await Voucher.findById(id)
    .populate("entries.ledgerId")
    .populate("createdBy");

  if (!voucher) throw new Error("Voucher not found");

  return voucher;
}

/* ======================
   GET BY VOUCHER NO
====================== */
async function getContraByVoucherNo(voucherNo) {
  const voucher = await Voucher.findOne({ voucherNo, type: "CONTRA" })
    .populate("entries.ledgerId")
    .populate("createdBy");

  if (!voucher) throw new Error("Voucher not found");

  return voucher;
}

module.exports = {
  createContraVoucher,
  updateContraVoucher,
  deleteContraVoucher,
  getAllContras,
  getContraById,
  getContraByVoucherNo,
};
