// =====================================================
// RETURN SERVICE (PRODUCTION READY)
// =====================================================

const Return = require("../models/return.models");
const { Stock } = require("../models/stock.models");
const { Asset } = require("../models/asset.models");
const {
  applyInventoryTransaction,
  runInventoryTransaction,
} = require("./inventory.service");

/**
 * Post Return
 * Handles:
 * 1. Site Return (IN)
 * 2. Purchase Return (OUT)
 */

const postReturn = async (returnId, userId) => {
  return runInventoryTransaction(async (session) => {
    const ret = await Return.findById(returnId).session(session);

    if (!ret) throw new Error("Return not found");

    if (ret.status === "POSTED") {
      throw new Error("Return already posted");
    }

    for (const item of ret.items) {
      const stock = await Stock.findById(item.stockId).session(session);
      if (!stock) throw new Error("Invalid stock item");

      if (!item.qty || item.qty <= 0) {
        throw new Error("Invalid quantity in return");
      }

      // =====================================================
      // SITE RETURN → STOCK IN
      // =====================================================
      if (ret.returnType === "SITE_RETURN") {
        await applyInventoryTransaction({
          type: "RETURN_IN",
          storeId: ret.storeId,
          stockId: item.stockId,
          qty: item.qty,
          rate: item.rate || 0, // original cost ideally
          referenceType: "RETURN",
          referenceId: ret._id,
          createdBy: userId,
          narration: `Site Return (${ret.returnNumber || ""})`,
          session,
        });
        // Asset back to store
        if (stock.itemType === "ASSET") {
          const assets = await Asset.find({
            stockId: stock._id,
            status: "ISSUED",
          })
            .limit(item.qty)
            .session(session);

          if (assets.length < item.qty) {
            throw new Error("Not enough issued assets to return");
          }

          for (const asset of assets) {
            asset.status = "AVAILABLE";
            asset.storeId = ret.storeId;
            asset.lastReturnRef = ret._id;
            await asset.save({ session });
          }
        }
      }
      // =====================================================
      // PURCHASE RETURN → STOCK OUT
      // =====================================================
      else if (ret.returnType === "PURCHASE_RETURN") {
        await applyInventoryTransaction({
          type: "RETURN_OUT",
          storeId: ret.storeId,
          stockId: item.stockId,
          qty: item.qty,
          rate: item.rate || 0,
          referenceType: "RETURN",
          referenceId: ret._id,
          createdBy: userId,
          narration: `Purchase Return (${ret.returnNumber || ""})`,
          session,
        });

        // Asset removal (if needed)
        if (stock.itemType === "ASSET") {
          const assets = await Asset.find({
            stockId: stock._id,
            storeId: ret.storeId,
            status: "AVAILABLE",
          })
            .limit(item.qty)
            .session(session);

          if (assets.length < item.qty) {
            throw new Error("Not enough assets to return to supplier");
          }

          for (const asset of assets) {
            asset.status = "DISPOSED";
            asset.lastReturnRef = ret._id;
            await asset.save({ session });
          }
        }
      } else {
        throw new Error("Invalid return type");
      }
    }

    // =====================================================
    // FINALIZE RETURN
    // =====================================================

    ret.status = "POSTED";
    ret.postedAt = new Date();

    await ret.save({ session });

    return ret;
  });
};

module.exports = { postReturn };
