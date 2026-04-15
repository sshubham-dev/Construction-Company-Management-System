const mongoose = require("mongoose");
const { Ledger, Group } = require("../models/ledger.models.js");

const groupMap = {
  CLIENT: "Sundry Debtors",
  SUPPLIER: "Sundry Creditors",
  CONTRACTOR: "Sundry Creditors",
  EMPLOYEE: "Sundry Creditors",
};

const syncLedger = async ({
  doc,
  category,
  getAddress = () => ({}),
  getTaxDetails = () => ({}),
}) => {
  if (!doc || !doc._id) {
    throw new Error("Invalid document passed to syncLedger");
  }

  // 1. Resolve group
  const groupName = groupMap[category.toUpperCase()];
  if (!groupName) {
    throw new Error(`Invalid category: ${category}`);
  }

  const group = await Group.findOne({
    name: groupName,
    companyId: doc.companyId,
  });

  if (!group) {
    throw new Error(`Group not found: ${groupName}`);
  }

  // 2. Prepare ledger data (ALWAYS FULL STATE)
  const ledgerData = {
    name: doc.name,
    alias: doc.name,
    groupId: group._id, // ✅ always updated
    companyId: doc.companyId,
    referenceType: category,
    referenceId: doc._id,
    mailingDetails: getAddress(doc),
    taxRegistrationDetails: getTaxDetails(doc),
    updatedAt: new Date(),
  };

  // 3. 🔥 SINGLE SOURCE OF TRUTH (UPSERT)
  const ledger = await Ledger.findOneAndUpdate(
    {
      referenceType: category,
      referenceId: doc._id,
      companyId: doc.companyId,
    },
    {
      $set: ledgerData,
      $setOnInsert: {
        openingBalance: 0,
        currentBalance: 0,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  // 4. Sync back reference (self-healing)
  if (!doc.ledger || doc.ledger.toString() !== ledger._id.toString()) {
    doc.ledger = ledger._id;
  }

  return ledger._id;
};

module.exports = { syncLedger };