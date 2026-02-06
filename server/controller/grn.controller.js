const  GRN  = require("../models/grn.models");
const { Store, StoreInventory } = require("../models/store.models");
const Ledger = require("../models/ledger.models");
const PurchaseOrder = require("../models/purchaseorder.models");

async function generateGRNNo(storeCode) {
  const count = await GRN.countDocuments();
  return `GRN/${storeCode}/${new Date().getFullYear()}/${String(
    count + 1
  ).padStart(4, "0")}`;
}

const createGRN = async (req, res) => {
  try {
    const { date, storeId, supplierId, purchaseOrderId, items } = req.body;

    // Validate quantities
    items.forEach((i) => {
      if (i.acceptedQty + i.rejectedQty !== i.receivedQty) {
        throw new Error("Accepted + Rejected must equal Received quantity");
      }
    });

    const store = await Store.findById(storeId);
    if (!store) throw new Error("Invalid Store");

    const grnNo = await generateGRNNo(store.code);

    // Calculate amounts
    const calculatedItems = items.map((i) => ({
      ...i,
      amount: i.acceptedQty * i.rate,
    }));

    const grossAmount = calculatedItems.reduce((a, b) => a + b.amount, 0);

    const grn = await GRN.create({
      grnNo,
      date,
      storeId,
      supplierId,
      purchaseOrderId,
      items: calculatedItems,
      grossAmount,
      gstAmount: 0,
      netAmount: grossAmount,
      createdBy: req.user._id,
      status: "Draft",
    });

    res.status(201).json(grn);
  } catch (err) {
    console.error("Create GRN Error:", err);
    res.status(400).json({ error: err.message });
  }
};

const updateGRN = async (req, res) => {
  try {
    const grn = await GRN.findById(req.params.id);
    if (!grn) throw new Error("GRN not found");
    if (grn.status !== "Draft") throw new Error("Only Draft GRN can be edited");

    req.body.items.forEach((i) => {
      if (i.acceptedQty + i.rejectedQty !== i.receivedQty) {
        throw new Error("Invalid quantities");
      }
    });

    grn.items = req.body.items.map((i) => ({
      ...i,
      amount: i.acceptedQty * i.rate,
    }));

    grn.grossAmount = grn.items.reduce((a, b) => a + b.amount, 0);
    grn.netAmount = grn.grossAmount;

    await grn.save();
    res.json(grn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const postGRN = async (req, res) => {
  try {
    const userId = req.user._id;

    const grn = await GRN.findById(req.params.id)
      .populate("items.stockId")
      .populate("storeId")
      .populate("purchaseOrderId");

    if (!grn) {
      return res.status(404).json({ message: "GRN not found" });
    }

    if (grn.status !== "Draft") {
      return res.status(400).json({ message: "GRN already posted" });
    }

    let grossAmount = 0;
    let totalGST = 0;

    /* ===============================
       1. UPDATE STORE INVENTORY
    =============================== */
    for (const item of grn.items) {
      if (item.acceptedQty <= 0) continue;

      const itemAmount = item.acceptedQty * item.rate;
      grossAmount += itemAmount;

      const gst = (itemAmount * (item.gstRate || 0)) / 100;
      totalGST += gst;

      let inventory = await StoreInventory.findOne({
        storeId: grn.storeId._id,
        stockId: item.stockId._id,
      });

      if (!inventory) {
        inventory = new StoreInventory({
          storeId: grn.storeId._id,
          stockId: item.stockId._id,
          qty: item.acceptedQty,
          avgRate: item.rate,
          value: itemAmount,
        });
      } else {
        const newQty = inventory.qty + item.acceptedQty;
        const newValue = inventory.value + itemAmount;

        inventory.qty = newQty;
        inventory.value = newValue;
        inventory.avgRate = newValue / newQty;
      }

      await inventory.save();
    }

    /* ===============================
       2. UPDATE PURCHASE ORDER
    =============================== */
    if (grn.purchaseOrderId) {
      const po = await PurchaseOrder.findById(grn.purchaseOrderId._id);

      if (po.finalApprovalStatus !== "Approved") {
        return res
          .status(400)
          .json({ message: "PO not approved for GRN" });
      }

      for (const grnItem of grn.items) {
        const poItem = po.items.find(
          (i) => i.itemId.toString() === grnItem.stockId._id.toString()
        );

        if (poItem) {
          poItem.receivedQty += grnItem.acceptedQty;
        }
      }

      // Delivery record
      po.deliveryRecords.push({
        grnId: grn._id,
        deliveryDate: new Date(),
        status: po.items.every(
          (i) => i.receivedQty >= i.requestedQty
        )
          ? "Full"
          : "Partial",
      });

      // Delivery status
      po.deliveryStatus = po.items.every(
        (i) => i.receivedQty >= i.requestedQty
      )
        ? "Delivered"
        : "Partially Delivered";

      await po.save();
    }

    /* ===============================
       3. UPDATE STORE SNAPSHOT
    =============================== */
    const store = await Store.findById(grn.storeId._id);
    store.currentStockValue =
      (store.currentStockValue || 0) + grossAmount;
    await store.save();

    /* ===============================
       4. FINALIZE GRN
    =============================== */
    grn.grossAmount = grossAmount;
    grn.gstAmount = totalGST;
    grn.netAmount = grossAmount + totalGST;
    grn.status = "Posted";
    grn.approvedBy = userId;

    const invoice = await createPurchaseInvoiceFromGRN(grn, req.user._id);
    grn.purchaseInvoiceId = invoice._id;

    
    await grn.save();


res.json({
  message: "GRN posted & Purchase Invoice created",
  grn,
  purchaseInvoice: invoice,
});
  } catch (err) {
    console.error("Post GRN Error:", err);
    res.status(500).json({ message: "Failed to post GRN" });
  }
};

// const postGRN = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const grn = await GRN.findById(req.params.id)
//       .populate("items.stockId")
//       .populate("storeId")
//       .populate("purchaseOrderId");

//     if (!grn) {
//       return res.status(404).json({ message: "GRN not found" });
//     }

//     if (grn.status !== "Draft") {
//       return res
//         .status(400)
//         .json({ message: "GRN already posted or cancelled" });
//     }

//     let grossAmount = 0;

//     /* ===============================
//        1. UPDATE STORE INVENTORY
//     =============================== */
//     for (const item of grn.items) {
//       const acceptedQty = item.acceptedQty;
//       if (acceptedQty <= 0) continue;

//       const amount = acceptedQty * item.rate;
//       grossAmount += amount;

//       let inventory = await StoreInventory.findOne({
//         storeId: grn.storeId._id,
//         stockId: item.stockId._id,
//       });

//       if (!inventory) {
//         inventory = new StoreInventory({
//           storeId: grn.storeId._id,
//           stockId: item.stockId._id,
//           qty: acceptedQty,
//           avgRate: item.rate,
//           value: amount,
//         });
//       } else {
//         const totalQty = inventory.qty + acceptedQty;
//         const totalValue = inventory.value + amount;

//         inventory.avgRate = totalValue / totalQty;
//         inventory.qty = totalQty;
//         inventory.value = totalValue;
//       }

//       await inventory.save();
//     }

//     /* ===============================
//        2. UPDATE PURCHASE ORDER
//     =============================== */
//     if (grn.purchaseOrderId) {
//       const po = await PurchaseOrder.findById(grn.purchaseOrderId._id);

//       if (po.deliveryStatus !== "Pending") {
//         throw new Error("PO cannot be edited after GRN is created");
//       }

//       for (const grnItem of grn.items) {
//         const poItem = po.items.find(
//           (i) => i.stockId.toString() === grnItem.stockId._id.toString()
//         );

//         if (poItem) {
//           poItem.receivedQty = (poItem.receivedQty || 0) + grnItem.acceptedQty;
//           poItem.pendingQty = poItem.orderedQty - poItem.receivedQty;

//           if (poItem.pendingQty <= 0) {
//             poItem.status = "Completed";
//           }
//         }
//       }

//       const allCompleted = po.items.every((i) => i.pendingQty <= 0);

//       if (allCompleted) {
//         po.status = "Completed";
//       }

//       await po.save();
//     }

//     /* ===============================
//        3. UPDATE STORE SNAPSHOT
//     =============================== */
//     const store = await Store.findById(grn.storeId._id);
//     store.currentStockValue = (store.currentStockValue || 0) + grossAmount;
//     await store.save();

//     /* ===============================
//        4. FINALIZE GRN
//     =============================== */
//     grn.grossAmount = grossAmount;
//     grn.gstAmount = (grossAmount * grn.storeId.gstRate) / 100;
//     grn.netAmount = grn.grossAmount + grn.gstAmount;
//     grn.status = "Posted";
//     grn.approvedBy = userId;

//     await grn.save();

//     res.json({
//       message: "GRN posted successfully",
//       grn,
//     });
//   } catch (err) {
//     console.error("Post GRN Error:", err);
//     res.status(500).json({ message: "Failed to post GRN" });
//   }
// };
// const postGRN = async (req, res) => {
//   try {
//     const grn = await GRN.findById(req.params.id);
//     if (!grn) throw new Error("GRN not found");
//     if (grn.status !== "Draft")
//       throw new Error("GRN already posted");

//     // Update store inventory
//     for (const item of grn.items) {
//       await StoreInventory.findOneAndUpdate(
//         {
//           storeId: grn.storeId,
//           stockId: item.stockId,
//         },
//         {
//           $inc: { quantity: item.acceptedQty },
//           $set: { lastUpdatedAt: new Date() },
//         },
//         { upsert: true, new: true }
//       );
//     }

//     // Update PO received quantity (if PO exists)
//     if (grn.purchaseOrderId) {
//       const po = await PurchaseOrder.findById(grn.purchaseOrderId);
//       grn.items.forEach(grnItem => {
//         const poItem = po.items.find(
//           i => i.stockId.toString() === grnItem.stockId.toString()
//         );
//         if (poItem) {
//           poItem.receivedQty += grnItem.acceptedQty;
//         }
//       });

//       po.status = po.items.every(
//         i => i.receivedQty >= i.quantity
//       )
//         ? "Completed"
//         : "Partial";

//       await po.save();
//     }

//     grn.status = "Posted";
//     grn.approvedBy = req.user._id;
//     await grn.save();

//     res.json({ message: "GRN posted successfully", grn });
//   } catch (err) {
//     console.error("Post GRN Error:", err);
//     res.status(400).json({ error: err.message });
//   }
// };

const cancelGRN = async (req, res) => {
  try {
    const userId = req.user._id;

    const grn = await GRN.findById(req.params.id)
      .populate("items.stockId")
      .populate("storeId")
      .populate("purchaseOrderId");

    if (!grn) {
      return res.status(404).json({ message: "GRN not found" });
    }

    if (grn.status !== "Posted") {
      return res
        .status(400)
        .json({ message: "Only posted GRN can be cancelled" });
    }

    if (grn.linkedPurchaseInvoiceId) {
      return res.status(400).json({
        message: "GRN linked to Purchase Invoice. Cannot cancel.",
      });
    }

    let reversalAmount = 0;

    /* ===============================
       1. REVERSE STORE INVENTORY
    =============================== */
    for (const item of grn.items) {
      if (item.acceptedQty <= 0) continue;

      const amount = item.acceptedQty * item.rate;
      reversalAmount += amount;

      const inventory = await StoreInventory.findOne({
        storeId: grn.storeId._id,
        stockId: item.stockId._id,
      });

      if (!inventory || inventory.qty < item.acceptedQty) {
        return res.status(400).json({
          message: `Insufficient stock to cancel GRN for ${item.stockId.name}`,
        });
      }

      inventory.qty -= item.acceptedQty;
      inventory.value -= amount;

      if (inventory.qty > 0) {
        inventory.avgRate = inventory.value / inventory.qty;
      } else {
        inventory.avgRate = 0;
        inventory.value = 0;
      }

      await inventory.save();
    }

    /* ===============================
       2. REVERSE PURCHASE ORDER
    =============================== */
    if (grn.purchaseOrderId) {
      const po = await PurchaseOrder.findById(grn.purchaseOrderId._id);

      for (const grnItem of grn.items) {
        const poItem = po.items.find(
          (i) =>
            i.itemId.toString() === grnItem.stockId._id.toString()
        );

        if (poItem) {
          poItem.receivedQty = Math.max(
            0,
            poItem.receivedQty - grnItem.acceptedQty
          );
        }
      }

      // Remove delivery record
      po.deliveryRecords = po.deliveryRecords.filter(
        (d) => d.grnId.toString() !== grn._id.toString()
      );

      // Recalculate delivery status
      po.deliveryStatus = po.items.every(
        (i) => i.receivedQty >= i.requestedQty
      )
        ? "Delivered"
        : po.items.some((i) => i.receivedQty > 0)
        ? "Partially Delivered"
        : "Pending";

      await po.save();
    }

    /* ===============================
       3. REVERSE STORE SNAPSHOT
    =============================== */
    const store = await Store.findById(grn.storeId._id);
    store.currentStockValue = Math.max(
      0,
      (store.currentStockValue || 0) - reversalAmount
    );
    await store.save();

    /* ===============================
       4. CANCEL GRN
    =============================== */
    grn.status = "Cancelled";
    grn.cancelledBy = userId;
    grn.cancelledAt = new Date();

    await grn.save();

    res.json({
      message: "GRN cancelled successfully",
      grn,
    });
  } catch (err) {
    console.error("Cancel GRN Error:", err);
    res.status(500).json({ message: "Failed to cancel GRN" });
  }
};


const listGRN = async (req, res) => {
  const grns = await GRN.find()
    .populate("storeId supplierId purchaseOrderId")
    .sort({ createdAt: -1 });
  res.json(grns);
};

const getGRN = async (req, res) => {
  const grn = await GRN.findById(req.params.id).populate(
    "storeId supplierId purchaseOrderId items.stockId"
  );
  res.json(grn);
};

module.exports = {
  createGRN,
  postGRN,
  cancelGRN,
  listGRN,
  getGRN,
  updateGRN,
};
