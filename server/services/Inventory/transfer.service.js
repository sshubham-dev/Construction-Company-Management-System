// =====================================================
// TRANSFER SERVICE (PRODUCTION READY)
// =====================================================
const { Stock, StockTransfer } = require("../models/stock.models");
const  {
  applyInventoryTransaction,
  runInventoryTransaction,
} = require("./inventory.service");

/**
 * Post Transfer → OUT from source + IN to destination
 */

const postTransfer = async (transferId, userId) => {
  return runInventoryTransaction(async (session) => {
    const transfer = await StockTransfer.findById(transferId).session(session);

    if (!transfer) throw new Error("Transfer not found");

    if (transfer.status === "POSTED") {
      throw new Error("Transfer already posted");
    }

    if (transfer.fromStoreId.toString() === transfer.toStoreId.toString()) {
      throw new Error("Source and destination store cannot be same");
    }

    for (const item of transfer.items) {
      const stock = await Stock.findById(item.stockId).session(session);
      if (!stock) throw new Error("Invalid stock item");

      if (!item.qty || item.qty <= 0) {
        throw new Error("Invalid quantity in transfer");
      }

      // ============================
      // STEP 1: OUT FROM SOURCE
      // ============================

      // get source inventory to extract avgRate
      const sourceInventory = await require("../models/storeInventory")
        .findOne({ storeId: transfer.fromStoreId, stockId: item.stockId })
        .session(session);

      if (!sourceInventory) {
        throw new Error("No stock available in source store");
      }

      const transferRate = sourceInventory.averageRate;
      await applyInventoryTransaction({
        type: "TRANSFER_OUT",
        storeId: transfer.fromStoreId,
        stockId: item.stockId,
        qty: item.qty,
        rate: transferRate,
        fromStoreId: transfer.fromStoreId,
        toStoreId: transfer.toStoreId,
        referenceType: "TRANSFER",
        referenceId: transfer._id,
        createdBy: userId,
        narration: `Stock Transfer OUT (${transfer.transferNumber || ""})`,
        session,
      });
      // ============================
      // STEP 2: IN TO DESTINATION
      // ============================

      await applyInventoryTransaction({
        type: "TRANSFER_IN",
        storeId: transfer.toStoreId,
        stockId: item.stockId,
        qty: item.qty,
        rate: transferRate, // SAME RATE (IMPORTANT)
        fromStoreId: transfer.fromStoreId,
        toStoreId: transfer.toStoreId,
        referenceType: "TRANSFER",
        referenceId: transfer._id,
        createdBy: userId,
        narration: `Stock Transfer IN (${transfer.transferNumber || ""})`,
        session,
      });

      // ============================
      // ASSET TRANSFER (IF APPLICABLE)
      // ============================

      if (stock.itemType === "ASSET") {
        const Asset = require("../models/asset.models");

        const assets = await Asset.find({
          stockId: stock._id,
          storeId: transfer.fromStoreId,
          status: "AVAILABLE",
        })
          .limit(item.qty)
          .session(session);

        if (assets.length < item.qty) {
          throw new Error("Not enough assets available for transfer");
        }

        for (const asset of assets) {
          asset.storeId = transfer.toStoreId;
          asset.lastTransferRef = transfer._id;
          await asset.save({ session });
        }
      }
    }

    // ============================
    // FINALIZE TRANSFER
    // ============================

    transfer.status = "POSTED";
    transfer.postedAt = new Date();

    await transfer.save({ session });

    return transfer;
  });
};

module.exports = {
  postTransfer,
};
