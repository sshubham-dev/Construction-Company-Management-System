const mongoose = require("mongoose");
const Voucher = require("../../../models/voucher.models");
const { generateVoucherNo } = require("../../../utils/voucherNoGenerator");

const validateEntries = (entries) => {
  if (!entries || entries.length < 2) {
    throw new Error("At least 2 entries required");
  }

  let debit = 0;
  let credit = 0;

  for (let e of entries) {
    if (!e.ledgerId || !e.amount) {
      throw new Error("Invalid entry");
    }

    if (e.type === "DEBIT") debit += e.amount;
    else if (e.type === "CREDIT") credit += e.amount;
    else throw new Error("Invalid entry type");
  }

  if (debit !== credit) {
    throw new Error("Voucher not balanced");
  }

  return { debit, credit };
};

const createVoucher = async (data) => {
  const {
    companyId,
    type,
    entries,
    date,
    narration,
    costCenterId,
    storeId,
    reference,
    referenceId,
    createdBy,
  } = data;

  if (!companyId || !type || !entries) {
    throw new Error("Missing required fields");
  }

  const { debit, credit } = validateEntries(entries);

  // 🔥 generate number
  const voucherNo = await generateVoucherNo({
    companyId,
    type,
  });

  const voucher = await Voucher.create({
    voucherNo,
    companyId,
    type,
    date,
    narration,
    entries,
    totalDebit: debit,
    totalCredit: credit,
    costCenterId,
    storeId,
    reference,
    referenceId,
    createdBy,
    status: "DRAFT",
  });

  return voucher;
};

const postVoucher = async (voucherId) => {
  const voucher = await Voucher.findById(voucherId);

  if (!voucher) throw new Error("Voucher not found");

  if (voucher.status !== "DRAFT") {
    throw new Error("Only draft voucher can be posted");
  }

  // 🔁 revalidate
  validateEntries(voucher.entries);

  voucher.status = "POSTED";
  voucher.postedAt = new Date();

  await voucher.save();

  return voucher;
};

const cancelVoucher = async (voucherId) => {
  const voucher = await Voucher.findById(voucherId);

  if (!voucher) throw new Error("Voucher not found");

  if (voucher.status !== "POSTED") {
    throw new Error("Only posted voucher can be cancelled");
  }

  voucher.status = "CANCELLED";
  voucher.cancelledAt = new Date();

  await voucher.save();

  return voucher;
};

const updateVoucher = async (voucherId, data) => {
  const voucher = await Voucher.findById(voucherId);

  if (!voucher) throw new Error("Voucher not found");

  if (voucher.status !== "DRAFT") {
    throw new Error("Only draft voucher can be edited");
  }

  if (data.entries) {
    const { debit, credit } = validateEntries(data.entries);
    voucher.totalDebit = debit;
    voucher.totalCredit = credit;
    voucher.entries = data.entries;
  }

  if (data.narration) voucher.narration = data.narration;
  if (data.date) voucher.date = data.date;

  await voucher.save();

  return voucher;
};

const getVouchers = async (companyId, filters = {}) => {
  const query = { companyId, ...filters };

  return await Voucher.find(query)
    .populate("entries.ledgerId")
    .sort({ date: -1 });
};

const getVoucherByReference = async (reference, referenceId) => {
  return await Voucher.findOne({ reference, referenceId });
};


module.exports = {
  createVoucher,
  postVoucher,
  cancelVoucher,
  updateVoucher,
  getVouchers,
  getVoucherByReference,
};
