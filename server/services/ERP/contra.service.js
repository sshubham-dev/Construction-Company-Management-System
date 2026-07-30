const Voucher = require("../../models/voucher.models");
const { Ledger } = require("../../models/ledger.models");
const { getVouchers } = require("./voucher/query.service");
const {
  generateVoucherNo,
  rebuildVoucherNumbers,
} = require("../../utils/voucher/voucherNoGenerator");
const getFinancialYear = require("../../utils/voucher/getFinancialYear");

/* ======================
   CREATE
====================== */
// ✅
async function createContraVoucher(data, user) {
  const { date, from, to, amount, narration, costCenterId } = data;

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

  const fy = getFinancialYear(date);

  const voucherNo = await generateVoucherNo({
    companyId: user.companyId,
    type: "CONTRA",
    fy: fy.code,
  });

  const voucher = await Voucher.create({
    voucherNo,
    type: "CONTRA",
    date,
    fy: fy.code,
    entries,
    narration,
    costCenterId: costCenterId || null,
    status: "DRAFT",
    companyId: user.companyId,
    createdBy: user._id,
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

  const fy = getFinancialYear(date);
  if (voucher.fy !== fy.code) {
    voucher.fy = fy.code
  }

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
  if (!voucher) {
    throw new Error("Voucher not found");
  }
  return {
    voucher
  };
}

async function getContraDetail(id) {
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
      status: voucher.status,
      date: voucher.date,
      fy: voucher.fy,
      narration: voucher.narration,
      reference: voucher.reference,

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
  getContraDetail,
  getContraByVoucherNo,
};
