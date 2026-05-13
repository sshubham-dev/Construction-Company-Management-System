const mongoose = require("mongoose");
const Return = require("../models/return.models");
const { Stock } = require("../models/stock.models");
const {
  sendApproveByAdmin,
  sendApproveByStoreIncharge,
} = require("./approval.controller.js");
const { sendPushNotification, notifyRole } = require("../utils/pushNotification.js");
const { postReturn } = require("../services/Inventory/return.service.js");


/* =====================================
   CREATE RETURN (NO INVENTORY CHANGE)
===================================== */
const createReturn = async (req, res) => {
  try {
    const ret = await Return.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: ret });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   VERIFY
========================= */
const verifyReturn = async (req, res) => {
  try {
    const ret = await Return.findById(req.params.id);

    if (!ret) throw new Error("Not found");
    if (ret.status !== "DRAFT") throw new Error("Invalid state");

    ret.status = "VERIFIED";
    await ret.save();

    res.json({ success: true, data: ret });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


/* =========================
   POST
========================= */
const postReturnController = async (req, res) => {
  try {
    const data = await postReturn(req.params.id, req.user._id);

    res.json({ success: true, data });

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
    const { id, itemId } = req.params;
    const { quantity, reason, remarks } = req.body;

    const ret = await Return.findById(id);

    if (!ret) {
      return res.status(404).json({
        success: false,
        message: "Return not found",
      });
    }

    /* =========================
       STATUS CHECK
    ========================== */
    if (ret.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft return can be edited",
      });
    }

    /* =========================
       FIND ITEM
    ========================== */
    const item = ret.items.find(
      (i) => i.itemId.toString() === itemId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in return",
      });
    }

    /* =========================
       VALIDATION
    ========================== */
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    if (reason) {
      const validReasons = [
        "EXCESS",
        "SCRAP",
        "DAMAGE",
        "TOOLS_RETURN",
        "SUPPLIER_RETURN",
      ];

      if (!validReasons.includes(reason)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reason",
        });
      }
    }

    /* =========================
       UPDATE FIELDS
    ========================== */
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (reason) item.reason = reason;
    if (remarks !== undefined) item.remarks = remarks;

    await ret.save();

    res.json({
      success: true,
      data: ret,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


const bulkUpdateReturnItems = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || !items.length) {
      throw new Error("Items array required");
    }

    const ret = await Return.findById(id).session(session);

    if (!ret) throw new Error("Return not found");

    if (ret.status !== "DRAFT") {
      throw new Error("Only draft return editable");
    }

    /* =========================
       FETCH STOCKS (BATCH)
    ========================== */
    const itemIds = items.map(i => i.itemId);

    const stocks = await Stock.find({
      itemId: { $in: itemIds },
      storeId: ret.fromStoreId,
    }).session(session);

    const stockMap = new Map(
      stocks.map(s => [s.itemId.toString(), s])
    );

    /* =========================
       VALIDATION + UPDATE
    ========================== */
    for (const input of items) {
      const { itemId, quantity, reason, remarks } = input;

      const existingItem = ret.items.find(
        i => i.itemId.toString() === itemId
      );

      if (!existingItem) {
        throw new Error(`Item not found: ${itemId}`);
      }

      if (quantity < 0) {
        throw new Error("Invalid quantity");
      }

      /* =========================
         STOCK VALIDATION
      ========================== */
      const stock = stockMap.get(itemId);

      if (!stock) {
        throw new Error(`Stock not found for item ${itemId}`);
      }

      const availableQty = stock.quantity - stock.reservedQty;

      if (quantity > availableQty) {
        throw new Error(
          `Insufficient stock for item ${itemId}. Available: ${availableQty}`
        );
      }

      /* =========================
         REASON VALIDATION
      ========================== */
      if (reason) {
        const validReasons = [
          "EXCESS",
          "SCRAP",
          "DAMAGE",
          "TOOLS_RETURN",
          "SUPPLIER_RETURN",
        ];

        if (!validReasons.includes(reason)) {
          throw new Error(`Invalid reason for item ${itemId}`);
        }
      }

      /* =========================
         UPDATE ITEM
      ========================== */
      existingItem.quantity = Number(quantity);

      if (reason) existingItem.reason = reason;
      if (remarks !== undefined) existingItem.remarks = remarks;
    }

    await ret.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Return items updated successfully",
      data: ret,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


module.exports = {
  createReturn,
  verifyReturn,
  postReturnController,
  getReturnById,
  getReturns,
  updateReturn,
  deleteReturn,
  getReturnItem,
  updateReturnItem,
};

