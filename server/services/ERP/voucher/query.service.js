const mongoose = require("mongoose");
const Voucher = require("../../../models/voucher.models");

async function getVouchers(type, query) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    fromDate,
    toDate,
    ledger,
    minAmount,
    maxAmount,
  } = query;

  const filter = { type };

  /* ======================
     STATUS
  ====================== */
  if (status) {
    filter.status = status;
  }

  /* ======================
     DATE FILTER
  ====================== */
  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) filter.date.$gte = new Date(fromDate);
    if (toDate) filter.date.$lte = new Date(toDate);
  }

  /* ======================
     AMOUNT FILTER
  ====================== */
  if (minAmount || maxAmount) {
    filter.totalDebit = {};

    if (minAmount) filter.totalDebit.$gte = Number(minAmount);
    if (maxAmount) filter.totalDebit.$lte = Number(maxAmount);
  }

  /* ======================
     LEDGER FILTER
  ====================== */
  if (ledger) {
    filter["entries.ledgerId"] = new mongoose.Types.ObjectId(ledger);
  }

  /* ======================
     SEARCH
  ====================== */
  if (search) {
    filter.$or = [
      { voucherNo: { $regex: search, $options: "i" } },
      { narration: { $regex: search, $options: "i" } },
    ];
  }

  /* ======================
     QUERY EXECUTION
  ====================== */
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Voucher.find(filter)
      .populate("entries.ledgerId")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),

    Voucher.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
}


module.exports = { getVouchers };