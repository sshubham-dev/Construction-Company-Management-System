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

  // 2. Prepare ledger data
  const ledgerData = {
    name: doc.name,
    alias: doc.name,
    groupId: group._id,
    companyId: doc.companyId,
    referenceType: category,
    referenceId: doc._id,
    mailingDetails: getAddress(doc),
    taxRegistrationDetails: getTaxDetails(doc),
    updatedAt: new Date(),
  };

  if (doc.ledger && !mongoose.Types.ObjectId.isValid(doc.ledger)) {
    doc.ledger = null;
  }

  // ✅ CASE 1: Try updating existing linked ledger
  if (doc.ledger) {
    console.log("Updating existing linked ledger");

    const updatedLedger = await Ledger.findByIdAndUpdate(
      doc.ledger,
      { $set: ledgerData },
      { returnDocument: "after" },
    );

    if (updatedLedger) {
      return updatedLedger._id;
    }

    // ❗ Broken reference fallback
    console.log("Ledger not found, will recreate");
  }

  // ✅ CASE 2: Find existing ledger (fallback)
  let ledger = await Ledger.findOne({
    referenceType: category,
    referenceId: doc._id,
  });

  // ✅ CASE 3: Create if not exists
  if (!ledger) {
    console.log("Creating new ledger");

    ledger = await Ledger.create({
      ...ledgerData,
      openingBalance: 0,
      currentBalance: 0,
    });
  } else {
    console.log("Updating found ledger");

    await Ledger.findByIdAndUpdate(
      ledger._id,
      { $set: ledgerData },
      { returnDocument: "after" },
    );
  }

  return ledger._id;
};

module.exports = { syncLedger };
