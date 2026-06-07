const Voucher = require("../../models/voucher.models");
const { Ledger } = require("../../models/ledger.models");
const { getVouchers } = require("./voucher/query.service");
const { generateVoucherNo, rebuildVoucherNumbers } = require("../../utils/voucherNoGenerator");
const { getFinancialYear } = require("../../utils/getFinancialYear");

/* ======================
   CREATE
====================== */
// ✅
async function createJournalVoucher(data, user) {
  const { date, narration, entries, costCenterId } = data;

  if (!date) throw Error("Date required");

  if (!entries || entries.length < 2) {
    throw new Error("Minimum two entries required");
  }

  let debit = 0;
  let credit = 0;

  const formattedEntries = [];

  for (const e of entries) {
    if (!e.ledgerId || !e.type || !e.amount) {
      throw new Error("Invalid entry");
    }

    const ledger = await Ledger.findById(e.ledgerId);
    if (!ledger) throw new Error("Ledger not found");

    if (e.type === "DEBIT") debit += e.amount;
    if (e.type === "CREDIT") credit += e.amount;

    formattedEntries.push({
      ledgerId: e.ledgerId,
      type: e.type,
      amount: e.amount,
    });
  }

  const fy = getFinancialYear(date);

  const voucherNo = await generateVoucherNo({
    companyId: user.companyId,
    type: "JOURNAL",
    fy: fy.code,
  });

  if (debit !== credit) {
    throw new Error("Debit and Credit must match");
  }

  const voucher = await Voucher.create({
    voucherNo,
    type: "JOURNAL",
    date,
    fy: fy.code,
    narration,
    entries: formattedEntries,
    totalDebit: debit,
    totalCredit: credit,
    costCenterId: costCenterId || null,
    companyId: user.companyId,
    status: "DRAFT",
    createdBy: user._id,
  });

  return voucher;
}

/* ======================
   UPDATE (ONLY DRAFT)
====================== */
async function updateJournalVoucher(id, data) {
  const voucher = await Voucher.findById(id);

  if (!voucher) throw new Error("Voucher not found");

  if (voucher.status !== "DRAFT") {
    throw new Error("Only Draft voucher can be updated");
  }

  const { entries, narration, date, costCenterId } = data;

  let debit = 0;
  let credit = 0;

  const formattedEntries = [];

  for (const e of entries) {
    if (!e.ledgerId || !e.type || !e.amount) {
      throw new Error("Invalid entry");
    }

    if (e.type === "DEBIT") debit += e.amount;
    if (e.type === "CREDIT") credit += e.amount;

    formattedEntries.push({
      ledgerId: e.ledgerId,
      type: e.type,
      amount: e.amount,
    });
  }

  if (debit !== credit) {
    throw new Error("Debit and Credit must match");
  }

  const fy = getFinancialYear(date);

  if (voucher.fy !== fy.code) {
    await rebuildVoucherNumbers({
      companyId: voucher.companyId,
      type: voucher.type,
      fy: fy.code,
    });
  }
  voucher.entries = formattedEntries;
  voucher.narration = narration;
  voucher.date = date;
  voucher.costCenterId = costCenterId || null;
  voucher.totalDebit = debit;
  voucher.totalCredit = credit;

  await voucher.save();

  return voucher;
}

/* ======================
   DELETE (ONLY DRAFT)
====================== */
// ✅
async function deleteJournalVoucher(id) {
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

/* ======================
   GET ALL
====================== */
// ✅
async function getAllJournals(query) {
  const result = await getVouchers("JOURNAL", query);
  return result;

}

/* ======================
   GET ONE
====================== */
async function getJournalById(id) {
  const voucher = await Voucher.findById(id)
    .populate("entries.ledgerId")
    .populate("createdBy");

  if (!voucher) throw new Error("Voucher not found");

  return voucher;
}

/* ======================
   GET BY VOUCHER NO
====================== */
async function getJournalByVoucherNo(voucherNo) {
  const voucher = await Voucher.findOne({ voucherNo, type: "JOURNAL" })
    .populate("entries.ledgerId")
    .populate("createdBy");

  if (!voucher) throw new Error("Voucher not found");

  return voucher;
}

module.exports = {
  createJournalVoucher,
  updateJournalVoucher,
  deleteJournalVoucher,
  getAllJournals,
  getJournalById,
  getJournalByVoucherNo,
};