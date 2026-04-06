// =====================================================
// DN SERVICE (PRODUCTION READY)
// =====================================================

const DN = require("../models/dn.models");
const PurchaseRequest = require("../models/purchaserequest.models");
const {Stock} = require("../models/stock.models");
const Asset = require("../models/asset.models");
const  {
  applyInventoryTransaction,
  runInventoryTransaction,
} = require("./inventory.service");

/**
 * Post DN → OUT flow + PR + Asset integration
 */

const postDN = async (dnId, userId) => {
  return runInventoryTransaction(async (session) => {
    const dn = await DN.findById(dnId).session(session);

    if (!dn) throw new Error("DN not found");

    if (dn.status === "POSTED") {
      throw new Error("DN already posted");
    }

    let pr = null;

    if (dn.prId) {
      pr = await PurchaseRequest.findById(dn.prId).session(session);
      if (!pr) throw new Error("Linked PR not found");
    }

    for (const item of dn.items) {
      const stock = await Stock.findById(item.stockId).session(session);
      if (!stock) throw new Error("Invalid stock item");

      if (!item.qty || item.qty <= 0) {
        throw new Error("Invalid quantity in DN");
      }

      // ============================
      // INVENTORY OUT
      // ============================

      await applyInventoryTransaction({
        type: "DN",
        storeId: dn.storeId,
        stockId: item.stockId,
        qty: item.qty,
        rate: 0, // avgRate will be used internally
        referenceType: "DN",
        referenceId: dn._id,
        createdBy: userId,
        narration: `DN Issue (${dn.dnNumber || ""})`,
        session,
      });

      // ============================
      // PR UPDATE (IF LINKED)
      // ============================

      if (pr) {
        const prItem = pr.items.find(
          (i) => i.itemId.toString() === item.stockId.toString(),
        );

        if (prItem) {
          prItem.issuedQty += item.qty;

          if (prItem.issuedQty > prItem.requestedQty) {
            throw new Error("Issued qty exceeds requested qty in PR");
          }
        }
      }

      // ============================
      // ASSET ISSUE (IF APPLICABLE)
      // ============================

      if (stock.itemType === "ASSET") {
        const availableAssets = await Asset.find({
          stockId: stock._id,
          storeId: dn.storeId,
          status: "AVAILABLE",
        })
          .limit(item.qty)
          .session(session);

        if (availableAssets.length < item.qty) {
          throw new Error("Not enough assets available");
        }

        for (const asset of availableAssets) {
          asset.status = "ISSUED";
          asset.issueReference = dn._id;
          await asset.save({ session });
        }
      }
    }
    // ============================
    // UPDATE PR STATUS
    // ============================

    if (pr) {
      const totalRequested = pr.items.reduce((s, i) => s + i.requestedQty, 0);
      const totalIssued = pr.items.reduce((s, i) => s + i.issuedQty, 0);

      if (totalIssued === 0) {
        pr.status = "APPROVED";
      } else if (totalIssued < totalRequested) {
        pr.status = "PARTIAL";
      } else {
        pr.status = "COMPLETED";
      }

      await pr.save({ session });
    }

    // ============================
    // FINALIZE DN
    // ============================

    dn.status = "POSTED";
    dn.postedAt = new Date();

    await dn.save({ session });

    return dn;
  });
};

module.exports = {
  postDN,
};
