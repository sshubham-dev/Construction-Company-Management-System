const mongoose = require("mongoose");
const Return = require("../models/return.models"); // Assuming the model is in the models folder
const {
  sendApproveByAdmin,
  sendApproveByStoreIncharge,
} = require("./approval.controller.js");
const Site = require("../models/site.models");
const User = require("../models/user.models");
const { StoreInventory } = require("../models/store.models");
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");
const SalesInvoice = require("../models/salesinvoice.models.js");
const {StockTransfer} = require("../models/stock.models.js");


/* =====================================
   CREATE RETURN (NO INVENTORY CHANGE)
===================================== */
const createReturn = async (req, res) => {
  try {
    const user = req.user;
    const { site, materialType, date, returnable, salesInvoiceId } = req.body;

    const existingSite = await Site.findById(site);
    if (!existingSite) throw new Error("Site not found");

    const invoice = await SalesInvoice.findById(salesInvoiceId);
    if (!invoice || invoice.status !== "Posted") {
      throw new Error("Invalid Sales Invoice");
    }

    const items = invoice.items.map((invItem, index) => {
      const userItem = returnable?.[index];

      const qty = Number(userItem?.quantity || 0);

      return {
        stockId: invItem.stockId,
        item: invItem.item,
        unit: invItem.unit,
        quantity: qty,
        rate: invItem.sellingRate,
        amount: qty * invItem.sellingRate,
      };
    });

    const returnDoc = await Return.create({
      site: { id: existingSite._id, name: existingSite.name },
      materialType,
      date,
      returnable: items,
      createdBy: user._id,
      salesInvoice: {
        id: invoice._id,
        invoiceNo: invoice.invoiceNo,
      },
      status: "Draft",
    });

    /* ===== APPROVAL FLOW ===== */
    sendApproveByStoreIncharge(returnDoc, "Return", user._id);

    /* ===== NOTIFICATION ===== */
    const employees = await User.find({ role: "Employee" });

    for (const emp of employees) {
      emp.notification.push({
        title: "Material Return",
        message: `Return requested for ${existingSite.name}`,
        createdAt: new Date(),
        link: `/return/${returnDoc._id}`,
      });
      await emp.save();
      sendPushNotification(emp._id, "New return request");
    }

    res.status(201).json({ success: true, data: returnDoc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   UPDATE RETURN (ONLY DRAFT)
===================================== */
const updateReturn = async (req, res) => {
  try {
    const returnDoc = await Return.findById(req.params.id);

    if (!returnDoc) throw new Error("Return not found");

    if (returnDoc.status !== "Draft") {
      throw new Error("Only draft return editable");
    }

    const { returnable, materialType, date } = req.body;

    if (materialType) returnDoc.materialType = materialType;
    if (date) returnDoc.date = date;

    if (Array.isArray(returnable)) {
      returnDoc.returnable = returnDoc.returnable.map((item, index) => {
        const userItem = returnable[index];
        const qty = Number(userItem?.quantity || item.quantity);

        return {
          ...item.toObject(),
          quantity: qty,
          amount: qty * item.rate,
        };
      });
    }

    await returnDoc.save();

    res.json({ success: true, data: returnDoc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   COMPLETE RETURN (CORE ENGINE)
===================================== */
const completeReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;

    const returnDoc = await Return.findById(req.params.id).session(session);

    if (!returnDoc) throw new Error("Return not found");

    if (returnDoc.status === "Completed") {
      throw new Error("Already completed");
    }

    const invoice = await SalesInvoice.findById(
      returnDoc.salesInvoice.id
    ).session(session);

    if (!invoice) throw new Error("Invoice not found");

    /* ===============================
       PROCESS ITEMS
    =============================== */
    for (const item of returnDoc.returnable) {
      const qty = Number(item.quantity || 0);
      if (qty <= 0) continue;

      await applyStoreStockMovement({
    storeId: storeId,
    stockId: item.stockId,
    quantity: item.receivedQuantity,
    direction: "IN",
    type: "RETURN",
    referenceType: "RETURN",
    referenceId: returnDoc._id,
    createdBy: user._id,
    session,
  });

      const invoiceItem = invoice.items.find(
        (i) => i.stockId.toString() === item.stockId.toString()
      );

      if (!invoiceItem) {
        throw new Error(`Invalid item ${item.item}`);
      }

      if (qty > invoiceItem.acceptedQty) {
        throw new Error(`Return exceeds delivered for ${item.item}`);
      }

      /* ===== STORE INVENTORY ↑ ===== */
      let storeInv = await StoreInventory.findOne({
        storeId: invoice.store.id,
        stockId: item.stockId,
      }).session(session);

      if (!storeInv) {
        storeInv = new StoreInventory({
          storeId: invoice.store.id,
          stockId: item.stockId,
          quantity: 0,
        });
      }

      storeInv.quantity += qty;
      await storeInv.save({ session });

      /* ===== TRANSFER ENTRY ===== */
      await StockTransfer.create(
        [
          {
            stockId: item.stockId,
            quantity: qty,
            rate: item.rate,
            fromType: "Site",
            fromId: returnDoc.site.id,
            toType: "Store",
            toId: invoice.store.id,
            referenceType: "RETURN",
            referenceId: returnDoc._id,
            createdBy: user._id,
          },
        ],
        { session }
      );
    }

    /* ===============================
       FINALIZE
    =============================== */
    returnDoc.status = "Completed";
    returnDoc.completedBy = user._id;
    returnDoc.completedAt = new Date();

    await returnDoc.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Return completed",
      data: returnDoc,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: err.message });
  }
};

/* =====================================
   GET
===================================== */
const getReturns = async (req, res) => {
  const data = await Return.find().sort({ createdAt: -1 });
  res.json(data);
};

const getReturnById = async (req, res) => {
  const data = await Return.findById(req.params.id);
  res.json(data);
};

/* =====================================
   DELETE (ONLY DRAFT)
===================================== */
const deleteReturn = async (req, res) => {
  const returnDoc = await Return.findById(req.params.id);

  if (!returnDoc) throw new Error("Return not found");

  if (returnDoc.status !== "Draft") {
    throw new Error("Only draft can delete");
  }

  await returnDoc.deleteOne();

  res.json({ message: "Deleted" });
};


const getReturnItem = async (req, res) => {
  try {
    const returnData = await Return.findById(req.params.id);
    if (!returnData) {
      return res
        .status(404)
        .json({ success: false, message: "Return not found" });
    }
    const data = returnData.returnable;
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateReturnItem = async (req, res) => {
  try {
    const id = req.params.id;
    const index = req.params.index;
    const existingReturnRequest = await Return.findById(id);
    if (!existingReturnRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Return not found" });
    }
    if (index < 0 || index >= existingReturnRequest.returnable.length) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }
    const { item, quantity, unit } = req.body;
    if (!item || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: "Item, quantity, and unit are required",
      });
    }
    existingReturnRequest.returnable[index] = {
      item: item || existingReturnRequest.returnable[index].item,
      quantity: quantity || existingReturnRequest.returnable[index].quantity,
      unit: unit || existingReturnRequest.returnable[index].unit,
      rate: rate || existingReturnRequest.returnable[index].rate,
      receivedQuantity:
        receivedQuantity ||
        existingReturnRequest.returnable[index].receivedQuantity,
      remarks: remarks || existingReturnRequest.returnable[index].remarks,
    };
    await existingReturnRequest.save();
    res.status(200).json(existingReturnRequest);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};



module.exports = {
  createReturn,
  completeReturn,
  getReturnById,
  getReturns,
  updateReturn,
  deleteReturn,
  getReturnItem,
  updateReturnItem,
};

