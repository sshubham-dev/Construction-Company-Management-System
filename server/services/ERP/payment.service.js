const Voucher = require("../../models/voucher.models");
const { Ledger } = require("../../models/ledger.models");
const InvoiceAllocation = require("../../models/invoiceAllocation.models");
const { getVouchers } = require("./voucher/query.service");
const { generateVoucherNo } = require("../../utils/voucherNoGenerator");


/* ======================
   CREATE PAYMENT VOUCHER
====================== */
// ✅
async function createPaymentVoucher(data, user) {
  const {
    date,
    from, // bank/cash
    to,   // vendor
    amount,
    narration,
    costCenterId,
    invoices = [],
  } = data;

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

  /* ======================
     CREATE ENTRIES
  ====================== */

  const entries = [
    { ledgerId: toLedger._id, type: "DEBIT", amount },
    { ledgerId: fromLedger._id, type: "CREDIT", amount },
  ];

      const voucherNo = await generateVoucherNo({
      companyId: user.companyId,
      type: "PAYMENT",
    });

  const voucher = await Voucher.create({
    voucherNo,
    type: "PAYMENT",
    date,
    entries,
    narration,
    costCenterId,
    status: "DRAFT",
      companyId: user.companyId,
      createdBy: user._id,
  });

  /* ======================
     SAVE INVOICE ALLOCATION (DRAFT)
  ====================== */

  // if (invoices.length > 0) {
  //   const allocations = invoices.map((inv) => ({
  //     voucherId: voucher._id,
  //     invoiceId: inv.invoiceId,
  //     amount: inv.amount,
  //     type: "PAYMENT",
  //   }));

  //   await InvoiceAllocation.insertMany(allocations);
  // }

  return voucher;
}

async function getAllPayments(query) {
const result = await getVouchers("PAYMENT", query);
  return result;

}

async function getPaymentById(id) {
  const voucher = await Voucher.findById(id)
    .populate("entries.ledgerId");

  const allocations = await InvoiceAllocation.find({ voucherId: id });

  return { voucher, allocations };
}

// ✅
async function deletePaymentVoucher(id) {
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
  createPaymentVoucher,
  // updatePaymentVoucher,
  getAllPayments,
  getPaymentById,
  deletePaymentVoucher,
};