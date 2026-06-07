const PurchaseVoucher = require("../models/purchaseVoucher.model");
const GRN = require("../models/grn.model");
const { getFinancialYear } = require("../../utils/getFinancialYear");

/* =========================
   CREATE FROM GRN
========================= */
async function createPurchaseVoucherFromGRN(grn, userId, session) {
  const exists = await PurchaseVoucher.findOne({ grnId: grn._id }).session(session);
  
  if (exists) return exists; // prevent duplicate

  const items = grn.items.map((i) => ({
    itemId: i.itemId,
    quantity: i.receivedQty - i.rejectedQty,
    rate: i.rate,
    taxRate: 0, // plug GST logic later
  }));

  const fy = getFinancialYear(date);

  const voucherNo = await generateVoucherNo({
    companyId: user.companyId,
    type: "CONTRA",
    fy: fy.code,
  });

  const voucher = new PurchaseVoucher({
    voucherNo: voucherNo,
    grnId: grn._id,
    supplierLedgerId: grn.supplierId,
    purchaseLedgerId: await getPurchaseLedger(grn),
    items,
    createdBy: userId,
  });

  await voucher.validate();

  /* =========================
     CREATE JOURNAL ENTRIES
  ========================== */
  voucher.entries = [
    {
      ledgerId: voucher.purchaseLedgerId,
      type: "DEBIT",
      amount: voucher.totalAmount,
    },
    {
      ledgerId: await getGSTLedger(),
      type: "DEBIT",
      amount: voucher.taxAmount,
    },
    {
      ledgerId: voucher.supplierLedgerId,
      type: "CREDIT",
      amount: voucher.netAmount,
    },
  ];

  voucher.status = "POSTED";

  await voucher.save({ session });

  return voucher;
}

module.exports = {
  createPurchaseVoucherFromGRN,
};