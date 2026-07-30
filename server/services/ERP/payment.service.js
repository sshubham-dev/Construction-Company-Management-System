const Voucher = require("../../models/voucher.models");
const { Ledger } = require("../../models/ledger.models");
// const BillAllocation = require("../../models/BillAllocation.models");
const { getVouchers } = require("./voucher/query.service");
const { generateVoucherNo, rebuildVoucherNumbers } = require("../../utils/voucher/voucherNoGenerator");
const getFinancialYear = require("../../utils/voucher/getFinancialYear");

/* ======================
   CREATE PAYMENT VOUCHER
====================== */
// ✅
async function createPaymentVoucher(data, user) {
  const {
    date,
    from, // bank/cash
    to, // vendor
    amount,
    narration,
    costCenterId,
    invoices = [],
  } = data;
  if (!date) throw Error("Date required");

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

  const fy = getFinancialYear(date);

  console.log("Generating...");
  const voucherNo = await generateVoucherNo({
    companyId: user.companyId,
    type: "PAYMENT",
    fy: fy.code,
  });
  console.log(voucherNo);

  const voucher = await Voucher.create({
    voucherNo,
    type: "PAYMENT",
    date,
    fy: fy.code,
    entries,
    narration,
    paidBy: "COMPANY",
    costCenterId: costCenterId || null,
    status: "DRAFT",
    companyId: user.companyId,
    createdBy: user._id,
  });

  return voucher;
}

async function updatePaymentVoucher(id, data) {
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
  } = data;

  const entries = [
    { ledgerId: to, type: "DEBIT", amount: Number(amount) },
    { ledgerId: from, type: "CREDIT", amount: Number(amount) },
  ];

  const fy = getFinancialYear(date);
  if (voucher.fy !== fy.code) {
    // throw new Error(
    //   `Voucher belongs to FY ${voucher.fy}. Financial Year cannot be changed.`
    // );
    await rebuildVoucherNumbers({
      companyId: voucher.companyId,
      type: voucher.type,
      fy: fy.code,
    });
    voucher.fy = fy.code;
  }

  voucher.entries = entries;
  voucher.narration = narration;
  voucher.date = date;
  voucher.costCenterId = costCenterId;

  await voucher.save();

  return voucher;
}

async function getAllPayments(query) {
  // if (fromDate || toDate) {
  //   filter.date = {};

  //   if (fromDate) {
  //     filter.date.$gte = new Date(fromDate);
  //   }

  //   if (toDate) {
  //     filter.date.$lte = new Date(toDate);
  //   }
  // }
  const result = await getVouchers("PAYMENT", query);
  return result;
}

async function getPaymentById(id) {
  const voucher = await Voucher.findById(id)
    .populate("entries.ledgerId")

  if (!voucher) {
    throw new Error("Voucher not found");
  }

  return {
    voucher
  };
}

async function getPayment(id) {
  const voucher = await Voucher.findById(id)
    .populate("entries.ledgerId", "name under referenceType")
    .populate("companyId", "name")
    .populate("createdBy", "userName")
    .populate("postedBy", "userName")
    .populate("costCenterId", "name")
    .lean();

  if (!voucher) {
    throw new Error("Voucher not found");
  }

  // Transform Entries
  let totalDebit = 0;
  let totalCredit = 0;

  voucher.entries = voucher.entries.map((entry) => {
    const amount = Number(entry.amount || 0);

    if (entry.type === "DEBIT") {
      totalDebit += amount;
    } else {
      totalCredit += amount;
    }

    return {
      ledgerId: entry.ledgerId?._id,
      ledger: entry.ledgerId?.name || "-",
      ledgerGroup: entry.ledgerId?.under || "-",
      referenceType: entry.ledgerId?.referenceType || null,
      type: entry.type,
      amount,
    };
  });

  // Timeline
  const timeline = [
    {
      type: "CREATED",
      user: voucher.createdBy?.userName || "-",
      date: voucher.createdAt,
    },
  ];

  if (voucher.postedAt) {
    timeline.push({
      type: "POSTED",
      user: voucher.postedBy?.userName || "-",
      date: voucher.postedAt,
    });
  }

  if (voucher.cancelledAt) {
    timeline.push({
      type: "CANCELLED",
      user: voucher.cancelledBy || "-",
      date: voucher.cancelledAt,
    });
  }

  return {
    voucher: {
      ...voucher,
      type: voucher.type,
      status: voucher.status,
      date: voucher.date,
      fy: voucher.fy,
      narration: voucher.narration,
      reference: voucher.reference,
      paidBy: voucher.paidBy,

      company: voucher.companyId,
      costCenter: voucher.costCenterId,

      entries: voucher.entries,
      totalDebit,
      totalCredit,
      balanced: totalDebit === totalCredit,
      timeline,
    },
  };
}

// ✅
async function deletePaymentVoucher(id) {
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
  createPaymentVoucher,
  updatePaymentVoucher,
  getAllPayments,
  getPaymentById,
  getPayment,
  deletePaymentVoucher,
};
