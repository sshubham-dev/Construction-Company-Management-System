// ================================
// AUDIT SERVICE
// ================================

const postAudit = async (audit) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of audit.items) {
      if (item.difference !== 0) {
        await exports.applyTransaction({
          type: "ADJUSTMENT",
          storeId: audit.storeId,
          stockId: item.stockId,
          qty: item.difference,
          rate: item.rate,
          referenceType: "AUDIT",
          referenceId: audit._id,
          session,
        });
      }
    }

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
