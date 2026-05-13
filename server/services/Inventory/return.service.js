const mongoose = require("mongoose");
const Return = require("../../models/return.models");
const PurchaseOrder = require("../../models/purchaseOrder.models");
const { executeStockTransaction } = require("./stock.service");

async function postReturn(returnId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ret = await Return.findById(returnId).session(session);

    if (!ret) throw new Error("Return not found");
    if (ret.status !== "VERIFIED") {
      throw new Error("Return must be verified");
    }

    let po;

    if (ret.type === "PURCHASE_RETURN" && ret.referenceId) {
      po = await PurchaseOrder.findById(ret.referenceId).session(session);
    }

    for (const item of ret.items) {
      if (item.quantity <= 0) continue;

      /* =========================
         SITE RETURN
      ========================== */
      if (ret.type === "SITE_RETURN") {
        await executeStockTransaction({
          itemId: item.itemId,
          fromStoreId: ret.fromStoreId,
          toStoreId: ret.toStoreId,
          quantity: item.quantity,
          rate: 0,
          type: "TRANSFER",
          source: "SITE_RETURN",
          referenceId: ret._id,
          userId,
        });
      }

      /* =========================
         PURCHASE RETURN
      ========================== */
      else if (ret.type === "PURCHASE_RETURN") {
        await executeStockTransaction({
          itemId: item.itemId,
          fromStoreId: ret.fromStoreId,
          quantity: item.quantity,
          rate: 0,
          type: "OUT",
          source: "PURCHASE_RETURN",
          referenceId: ret._id,
          userId,
        });

        /* UPDATE PO */
        if (po) {
          const poItem = po.items.find(
            i => i.itemId.toString() === item.itemId.toString()
          );

          if (poItem) {
            poItem.receivedQty -= item.quantity;
          }
        }
      }

      /* =========================
         ADJUSTMENT
      ========================== */
      else if (ret.type === "ADJUSTMENT") {
        await executeStockTransaction({
          itemId: item.itemId,
          fromStoreId: ret.fromStoreId,
          quantity: item.quantity,
          rate: 0,
          type: "OUT",
          source: "ADJUSTMENT",
          referenceId: ret._id,
          userId,
        });
      }
    }

    /* =========================
       UPDATE PO STATUS
    ========================== */
    if (po) {
      po.updateStatus();
      await po.save({ session });
    }

    ret.status = "POSTED";
    ret.postedAt = new Date();

    await ret.save({ session });

    await session.commitTransaction();
    session.endSession();

    return ret;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = { postReturn };