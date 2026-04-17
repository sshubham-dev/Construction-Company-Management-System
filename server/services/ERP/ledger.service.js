const LedgerEntry = require("../../models/ledgerEntry.models");
const { Ledger, Group } = require("../../models/ledger.models");
const Client = require("../../models/client.models");
const Contractor = require("../../models/contractor.models");
const Supplier = require("../../models/supplier.models");
const Employee = require("../../models/employee.models");

// ✅
async function getLedgerReport({ ledgerId, fromDate, toDate }) {
  if (!ledgerId) throw new Error("LedgerId is required");

  const match = {
    ledgerId,
  };

  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  /* ======================
     FETCH ENTRIES
  ====================== */
  const entries = await LedgerEntry.find(match)
    .sort({ date: 1 })
    .populate("voucherId");

  /* ======================
     CALCULATE RUNNING BALANCE
  ====================== */
  let balance = 0;

  const report = entries.map((e) => {
    if (e.type === "DEBIT") balance += e.amount;
    else balance -= e.amount;

    return {
      date: e.date,
      voucherNo: e.voucherId?.voucherNo,
      type: e.type,
      amount: e.amount,
      balance,
      narration: e.voucherId?.narration,
    };
  });

  return report;
}

// services/ledger.service.js

// ✅
const createLedger = async (data) => {
  const {
    name,
    alias,
    groupId,
    companyId,
    referenceId,
    referenceType,
    mailingDetails,
    bankingDetails,
    statutoryDetails,
    taxDetails,
    openingBalance,
  } = data;

  if (!name || !groupId || !companyId) {
    throw new Error("name, groupId, companyId required");
  }

  const ledger = await Ledger.create({
    name,
    alias,
    groupId,
    companyId,
    referenceType: referenceType || null,
    referenceId: referenceId || null,
    openingBalance,
    statutoryDetails,
    mailingDetails,
    bankingDetails,
    taxDetails,
  });

  return ledger;
};

// ✅
const getLedgers = async (companyId) => {
  return await Ledger.find({ companyId })
    .populate("groupId")
    .populate("referenceId")
    .populate("companyId")
    .sort({ name: 1 });
};


const getLedgerById = async (id) => {
  return await Ledger.findById(id)
    .populate("groupId")
    .populate("referenceId")
    .populate("companyId")
    .exec();
};

// ✅
const updateLedger = async (id, data) => {
  const allowedFields = [
    "name",
    "alias",
    "groupId",
    "companyId",
    "statutoryDetails",
    "mailingDetails",
    "bankingDetails",
    "taxDetails",
    "isActive",
  ];

  const updates = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  });

  return await Ledger.findByIdAndUpdate(id, updates);
};


const deleteLedger = async (id) => {
  return await Ledger.findByIdAndDelete(id);
};

// services/ledgerMapping.service.js

const modelMap = {
  Client,
  Contractor,
  Supplier,
  Employee,
};

const mapLedger = async (ledger, referenceType, referenceId) => {
  if (!referenceType || !referenceId) return;

  const Model = modelMap[referenceType];

  if (!Model) throw new Error("Invalid referenceType");

  await Model.findByIdAndUpdate(referenceId, {
    ledger: ledger._id,
  });
};

module.exports = {
  createLedger,
  getLedgers,
  getLedgerById,
  updateLedger,
  deleteLedger,
  mapLedger,
  getLedgerReport,
};
