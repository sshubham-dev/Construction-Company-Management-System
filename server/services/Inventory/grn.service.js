// =====================================================
// GRN SERVICE (PRODUCTION READY)
// =====================================================

const GRN = require("../models/grn.models");
const {Stock} = require("../models/stock.models");
const  {
  applyInventoryTransaction,
  runInventoryTransaction,
} = require("./inventory.service");

/**
 * Post GRN → Creates inventory IN transactions
 */

const postGRN = async (grnId, userId) => {
  return runInventoryTransaction(async (session) => {
    const grn = await GRN.findById(grnId).session(session);

    if (!grn) throw new Error("GRN not found");

    if (grn.status === "POSTED") {
      throw new Error("GRN already posted");
    }

    for (const item of grn.items) {
      const stock = await Stock.findById(item.stockId).session(session);
      if (!stock) throw new Error("Invalid stock item");

      if (!item.qty || item.qty <= 0) {
        throw new Error("Invalid quantity in GRN");
      }

      if (!item.rate || item.rate < 0) {
        throw new Error("Invalid rate in GRN");
      }

      await applyInventoryTransaction({
        type: "GRN",
        storeId: grn.storeId,
        stockId: item.stockId,
        qty: item.qty,
        rate: item.rate,
        referenceType: "GRN",
        referenceId: grn._id,
        createdBy: userId,
        narration: `GRN Posting (${grn.grnNumber || ""})`,
        session,
      });

      // ============================
      // ASSET CREATION (IF APPLICABLE)
      // ============================
      if (stock.itemType === "ASSET") {
        const Asset = require("../models/asset.models");

        const assetsToCreate = [];

        for (let i = 0; i < item.qty; i++) {
          assetsToCreate.push({
            stockId: stock._id,
            storeId: grn.storeId,
            status: "AVAILABLE",
            purchaseRate: item.rate,
            referenceId: grn._id,
          });
        }

        await Asset.insertMany(assetsToCreate, { session });
      }
    }

    // ============================
    // UPDATE GRN STATUS
    // ============================

    grn.status = "POSTED";
    grn.postedAt = new Date();

    await grn.save({ session });

    return grn;
  });
};

module.exports = {
  postGRN,
};
