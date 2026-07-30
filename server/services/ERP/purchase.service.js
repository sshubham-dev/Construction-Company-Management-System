const Voucher = require("../../models/voucher.models");
const { Ledger } = require("../../models/ledger.models");
const GRN = require("../models/grn.model");
const Purchase = require("../../models/purchase.models");
const Supplier = require("../../models/supplier.models");
const { generateVoucherNo, rebuildVoucherNumbers } = require("../../utils/voucher/voucherNoGenerator");
const getFinancialYear = require("../../utils/voucher/getFinancialYear");
const AppError = require("../../utils/AppError");

/* =========================
   CREATE FROM GRN
========================= */
async function createPurchaseVoucherFromGRN(grn, userId, session) {
  const exists = await Purchase.findOne({ grnId: grn._id }).session(session);

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
    type: "PURCHASE",
    fy: fy.code,
  });

  const voucher = new Voucher({
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



const createPurchaseVoucher = async (
  purchase,
  user,
  session
) => {
  // Supplier Ledger
  if (!purchase.supplierId.ledgerId) {
    throw new AppError(
      "Supplier ledger not found.",
      400
    );
  }

  const fy = getFinancialYear(purchase.date);

  const voucherNo = await generateVoucherNo({
    companyId: user.companyId,
    type: "PURCHASE",
    fy: fy.code,
  });

  const entries = [];

  // Purchase Items
  for (const item of purchase.items) {
    let ledgerId = null;

    switch (item.type) {
      case "STOCK":
        ledgerId = item.stockId.purchaseLedger;
        break;

      case "SERVICE":
      case "EXPENSE":
      case "ASSET":
        ledgerId = item.ledgerId;
        break;
    }

    if (!ledgerId) {
      throw new AppError(
        `Ledger missing for ${item.description}.`,
        400
      );
    }

    entries.push({
      ledgerId,
      debit: item.taxableAmount,
      credit: 0,
      narration: item.description,
    });
  }

  // CGST

  if (purchase.cgst > 0) {
    entries.push({
      ledgerId: process.env.INPUT_CGST_LEDGER,
      debit: purchase.cgst,
      credit: 0,
    });
  }

  // SGST

  if (purchase.sgst > 0) {
    entries.push({
      ledgerId: process.env.INPUT_SGST_LEDGER,
      debit: purchase.sgst,
      credit: 0,
    });
  }

  // IGST

  if (purchase.igst > 0) {
    entries.push({
      ledgerId: process.env.INPUT_IGST_LEDGER,
      debit: purchase.igst,
      credit: 0,
    });
  }

  // Freight

  if (purchase.freight > 0) {
    entries.push({
      ledgerId: process.env.FREIGHT_LEDGER,
      debit: purchase.freight,
      credit: 0,
    });
  }

  // Other Charges

  if (purchase.otherCharges > 0) {
    entries.push({
      ledgerId: process.env.OTHER_CHARGE_LEDGER,
      debit: purchase.otherCharges,
      credit: 0,
    });
  }

  // Supplier

  entries.push({
    ledgerId: purchase.supplierId.ledgerId,
    debit: 0,
    credit: purchase.grandTotal,
  });

  const voucher = await Voucher.create(
    [
      {
        voucherNo,

        type: "PURCHASE",

        companyId: purchase.companyId,

        fy: fy.code,

        date: purchase.date,

        reference: purchase.purchaseInvoiceNo,

        referenceType: "PURCHASE",

        referenceId: purchase._id,

        narration: purchase.narration,

        entries,

        status: "POSTED",

        createdBy: user._id,

        postedBy: user._id,
      },
    ],
    { session }
  );

  return voucher[0];
};


module.exports = {
  createPurchaseVoucherFromGRN,
  createPurchaseVoucher,
};