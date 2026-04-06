const Voucher = require("../../models/voucher.models");
const { Ledger } = require("../../models/ledger.models");
const InvoiceAllocation = require("../../models/invoiceAllocation.models");
const { getVouchers } = require("./voucher/query.service");
const { generateVoucherNo } = require("../../utils/voucherNoGenerator");

/* ======================
   CREATE
====================== */
async function createReceiptVoucher(data, user) {
  const {
    date,
    from, // client
    to, // bank/cash
    amount,
    narration,
    costCenterId,
    companyId,
  } = data;

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

  const voucherNo = await generateVoucherNo({
    companyId: data.companyId,
    type: "RECEIPT",
  });

  const voucher = await Voucher.create({
    voucherNo,
    type: "RECEIPT",
    date,
    entries,
    narration,
    costCenterId,
    status: "DRAFT",
    companyId,
  });

  /* ======================
     SAVE INVOICE ALLOCATION
  ====================== */

  if (invoices.length > 0) {
    const allocations = invoices.map((inv) => ({
      voucherId: voucher._id,
      invoiceId: inv.invoiceId,
      amount: inv.amount,
      type: "RECEIPT",
    }));

    await InvoiceAllocation.insertMany(allocations);
  }

  return voucher;
}

async function updateReceiptVoucher(id, data) {
  const voucher = await Voucher.findById(id);

  if (!voucher) throw new Error("Voucher not found");

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
    invoices = [],
  } = data;

  const entries = [
    { ledgerId: to, type: "DEBIT", amount },
    { ledgerId: from, type: "CREDIT", amount },
  ];

  voucher.entries = entries;
  voucher.narration = narration;
  voucher.date = date;
  voucher.costCenterId = costCenterId;

  await voucher.save();

  await InvoiceAllocation.deleteMany({ voucherId: id });

  if (invoices.length > 0) {
    const allocations = invoices.map((inv) => ({
      voucherId: id,
      invoiceId: inv.invoiceId,
      amount: inv.amount,
      type: "RECEIPT",
    }));

    await InvoiceAllocation.insertMany(allocations);
  }

  return voucher;
}

async function getAllReceipts(query) {
  const result = await getVouchers("RECEIPT", query);
  return result;
}

async function getReceiptById(id) {
  const voucher = await Voucher.findById(id).populate("entries.ledgerId");

  const allocations = await InvoiceAllocation.find({ voucherId: id });

  return { voucher, allocations };
}

async function deleteReceiptVoucher(id) {
  const voucher = await Voucher.findById(id);

  if (!voucher) throw new Error("Voucher not found");

  if (voucher.status !== "DRAFT") {
    throw new Error("Only Draft voucher can be deleted");
  }

  await InvoiceAllocation.deleteMany({ voucherId: id });
  await voucher.deleteOne();

  return true;
}

module.exports = {
  createReceiptVoucher,
  updateReceiptVoucher,
  getAllReceipts,
  getReceiptById,
  deleteReceiptVoucher,
};
