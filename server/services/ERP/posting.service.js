const Voucher = require("../../models/voucher.models");
const LedgerEntry = require("../../models/ledgerEntry.models");
const InvoiceAllocation = require("../../models/invoiceAllocation.models");
const { applyInvoiceAdjustments, reverseInvoiceAdjustments } = require("./invoiceAdjustment.service");

/* ======================
   POST VOUCHER
====================== */
async function postVoucher(voucherId, user) {
  const voucher = await Voucher.findById(voucherId);

  if (!voucher) {
    throw new Error("Voucher not found");
  }

  if (voucher.status !== "DRAFT") {
    throw new Error("Only DRAFT voucher can be posted");
  }

  if (!voucher.entries || voucher.entries.length < 2) {
    throw new Error("Invalid voucher entries");
  }

  /* ======================
     VALIDATE BALANCE
  ====================== */

  let totalDebit = 0;
  let totalCredit = 0;

  for (const entry of voucher.entries) {
    if (entry.type === "DEBIT") totalDebit += entry.amount;
    else totalCredit += entry.amount;
  }

  if (totalDebit !== totalCredit) {
    throw new Error("Voucher not balanced");
  }

/* ======================
   VALIDATE ALLOCATION
====================== */

const allocations = await InvoiceAllocation.find({ voucherId: voucher._id });

const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);

// For PAYMENT → credit side matters
// For RECEIPT → debit side matters

let voucherAmount = 0;

if (voucher.type === "PAYMENT") {
  voucherAmount = voucher.totalCredit;
} else if (voucher.type === "RECEIPT") {
  voucherAmount = voucher.totalDebit;
}

if (totalAllocated > voucherAmount) {
  throw new Error("Allocated amount exceeds voucher amount");
}

  /* ======================
     CREATE LEDGER ENTRIES
  ====================== */

  const ledgerEntries = voucher.entries.map((entry) => ({
    date: voucher.date,
    ledgerId: entry.ledgerId,
    debit: entry.type === "DEBIT" ? entry.amount : 0,
    credit: entry.type === "CREDIT" ? entry.amount : 0,
    voucherId: voucher._id,
    voucherType: voucher.type,
    narration: voucher.narration,
  }));

  await LedgerEntry.insertMany(ledgerEntries);
/* APPLY INVOICE ADJUSTMENT */
await applyInvoiceAdjustments(voucher._id);

  /* ======================
     UPDATE VOUCHER STATUS
  ====================== */

  voucher.status = "POSTED";
  voucher.postedAt = new Date();
  voucher.postedBy = user._id;

  await voucher.save();

  return voucher;
}

async function cancelVoucher(voucherId, user) {
  const voucher = await Voucher.findById(voucherId);

  if (!voucher) {
    throw new Error("Voucher not found");
  }

  if (voucher.status !== "POSTED") {
    throw new Error("Only POSTED voucher can be cancelled");
  }

  const existingEntries = await LedgerEntry.find({
    voucherId: voucher._id,
  });

  const reverseEntries = existingEntries.map((entry) => ({
    date: new Date(),
    ledgerId: entry.ledgerId,
    debit: entry.credit,
    credit: entry.debit,
    voucherId: voucher._id,
    voucherType: "REVERSAL",
    narration: "Reversal of voucher",
  }));

  await LedgerEntry.insertMany(reverseEntries);
/* REVERSE INVOICE ADJUSTMENT */
await reverseInvoiceAdjustments(voucher._id);

  voucher.status = "CANCELLED";
  voucher.cancelledAt = new Date();
  // voucher.cancelledBy = user._id;

  await voucher.save();

  return voucher;
}

module.exports = {
    postVoucher, 
    cancelVoucher
}