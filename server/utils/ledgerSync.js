
const { Ledger } = require('../models/ledger.models.js');

const syncLedger = async ({
  doc,
  type,
  under,
  getAddress = () => ({}),
  getTaxDetails = () => ({}),
}) => {
  const ledgerData = {
    name: doc.name,
    alias: doc.name,
    referenceType: type,
    referenceId: doc._id,
    under,
    mailingDetails: getAddress(doc),
    taxRegistrationDetails: getTaxDetails(doc),
    updatedAt: new Date(),
  };

  // 1. If ledger already linked, UPDATE ONLY
  if (doc.ledger) {
    await Ledger.updateOne(
      { _id: doc.ledger },
      { $set: ledgerData }
    );
    return doc.ledger;
  }

  // 2. Fallback: find by reference (for legacy data)
  let ledger = await Ledger.findOne({
    referenceType: type,
    referenceId: doc._id,
  });

  // 3. Create only if truly missing
  if (!ledger) {
    ledger = await Ledger.create({
      ...ledgerData,
      openingBalance: 0,
      currentBalance: 0,
    });
  }

  return ledger._id;
};



module.exports = { syncLedger };
