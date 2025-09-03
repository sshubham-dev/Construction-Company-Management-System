const { Ledger } = require('../models/ledger.models.js');

const syncLedger = async ({
    doc,
    type,
    fieldsToWatch = [],
    under,
    getAddress = () => ({}),
    getTaxDetails = () => ({}),
}) => {
    try {
        console.log(`[${type} Ledger Sync] Processing document:`, doc._id);

        const shouldSync =
            doc.isNew || fieldsToWatch.some((field) => doc.isModified(field));

        if (!shouldSync) {
            console.log(`[${type} Ledger Sync] No relevant changes — skipping.`);
            return;
        }

        const existingLedger = await Ledger.findOne({
            referenceId: doc._id,
            referenceType: type,
        });

        const ledgerData = {
            name: doc.name,
            alias: doc.name,
            referenceType: type,
            referenceId: doc._id,
            under,
            mailingDetails: getAddress(doc),
            taxRegistrationDetails: getTaxDetails(doc),
        };

        console.log('✅ Ledger Data Prepared:', ledgerData);

        if (existingLedger) {
            await Ledger.updateOne({ _id: existingLedger._id }, { $set: ledgerData });
            console.log(`[${type} Ledger Sync] Updated ledger for ${doc.name}`);
            return existingLedger._id;
        } else {
            const newLedger = await Ledger.create({
                ...ledgerData,
                openingBalance: 0,
            });
            console.log(`[${type} Ledger Sync] Created ledger for ${doc.name}`);
            return newLedger._id;
        }

    } catch (error) {
        console.error(`[${type} Ledger Sync] Error:`, error);
        throw error;
    }
};

module.exports = { syncLedger };
