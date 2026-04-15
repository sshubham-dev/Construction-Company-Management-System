const mongoose = require("mongoose");
const { Stock, Stock_Group, Item } = require("../models/stock.models");
const {
  StoreInventory,
  StoreStockMovement,
} = require("../models/store.models");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");

// const StoreInventory = mongoose.model("StoreInventory");
// const StoreStockMovement = mongoose.model("StoreStockMovement");

/* =====================================
   UTILITY: CALCULATE SALE PRICE
===================================== */
function calcSalePrice(stock) {
  const surcharge = {
    staffSalary: stock?.surchargePercentage?.staffSalary || 0,
    profit: stock?.surchargePercentage?.profit || 0,
    expenses: stock?.surchargePercentage?.expenses || 0,
    investment: stock?.surchargePercentage?.investment || 0,
    tax: stock?.surchargePercentage?.tax || 0,
  };

  const totalPercent =
    surcharge.staffSalary +
    surcharge.profit +
    surcharge.expenses +
    surcharge.investment +
    surcharge.tax;

  return stock.purchasePrice + (stock.purchasePrice * totalPercent) / 100;
}

/* =====================================
   CREATE STOCK (MASTER)
===================================== */
const createStock = async (req, res) => {
  try {
    const { storeId, itemId, quantity, reservedQuantity } = req.body;

    if (!data.name || !data.category || !data.unit) {
      throw new Error("Name, category, unit required");
    }

    const stock = new Stock({
      storeId,
      itemId,
      quantity,
      reservedQuantity,
    });

    await stock.save();

    res.status(201).json(stock);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET ALL STOCK
===================================== */
const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ createdAt: -1 });

    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================
   GET STOCK BY ID
===================================== */
const getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) throw new Error("Stock not found");

    res.json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   UPDATE STOCK (MASTER ONLY)
===================================== */
const updateStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) throw new Error("Stock not found");

    const allowedFields = [
      "name",
      "category",
      "unit",
      "purchasePrice",
      "gstRate",
      "surchargePercentage",
      "description",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        stock[field] = req.body[field];
      }
    });

    stock.salePrice = calcSalePrice(stock);

    await stock.save();

    res.json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   DELETE STOCK
===================================== */
const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) throw new Error("Stock not found");

    // Optional: prevent delete if used
    // const used = await StoreInventory.findOne({ stockId: stock._id });

    await stock.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   CREATE STOCK ITEM (MASTER)
===================================== */
const createStockItem = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.category || !data.unit) {
      throw new Error("Name, category, unit required");
    }

    // Prevent duplicate
    const exists = await Item.findOne({
      name: data.name,
      unit: data.unit,
    });

    if (exists) {
      throw new Error("Item already exists");
    }

    const item = new Item({
      name: data.name,
      category: data.category,
      unit: data.unit,
      itemType: data.itemType || "CONSUMABLE",

      code: data.code,
      gstRate: Number(data.gstRate || 0),

      purchasePrice: Number(data.purchasePrice || 0),
      mrp: Number(data.mrp),
    });

    await item.save();

    res.status(201).json(item);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET ALL STOCK ITEM
===================================== */
const getStockItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================
   GET STOCK ITEM BY ID
===================================== */
const getStockItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) throw new Error("Item not found");

    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   UPDATE STOCK (MASTER ONLY)
===================================== */
const updateStockItem = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) throw new Error("Stock not found");

    const allowedFields = [
      "name",
      "category",
      "unit",
      "purchasePrice",
      "gstRate",
      "surchargePercentage",
      "description",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        stock[field] = req.body[field];
      }
    });

    stock.salePrice = calcSalePrice(stock);

    await stock.save();

    res.json(stock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   DELETE STOCK
===================================== */
const deleteStockItem = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) throw new Error("Stock not found");

    // Optional: prevent delete if used
    // const used = await StoreInventory.findOne({ stockId: stock._id });

    await stock.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   CREATE STOCK GROUP
===================================== */
const createStockGroup = async (req, res) => {
  try {
    const { name, code, unit } = req.body;

    if (!name) throw new Error("Name required");

    const exists = await Stock_Group.findOne({ name });
    if (exists) throw new Error("Group already exists");

    const group = await Stock_Group.create({
      name,
      code,
      unit,
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET GROUPS
===================================== */
const getStockGroups = async (req, res) => {
  const data = await Stock_Group.find();
  res.json(data);
};

/* =====================================
   UPDATE GROUP
===================================== */
const updateStockGroup = async (req, res) => {
  try {
    const group = await Stock_Group.findById(req.params.id);

    if (!group) throw new Error("Group not found");

    Object.assign(group, req.body);

    await group.save();

    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   DELETE GROUP
===================================== */
const deleteStockGroup = async (req, res) => {
  try {
    const group = await Stock_Group.findById(req.params.id);

    if (!group) throw new Error("Group not found");

    await group.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const applyStoreStockMovement = async ({
  storeId,
  stockId,
  quantity,
  rate = 0,
  direction,
  type,
  referenceType,
  referenceId,
  narration,
  createdBy,
  session,
}) => {
  if (!["IN", "OUT"].includes(direction)) {
    throw new Error("Invalid direction");
  }

  let inventory = await StoreInventory.findOne({
    storeId,
    stockId,
  }).session(session);

  if (!inventory) {
    inventory = new StoreInventory({
      storeId,
      stockId,
      quantity: 0,
      averageRate: 0,
    });
  }

  /* =========================
     IN (GRN / RETURN)
  ========================== */
  if (direction === "IN") {
    const newQty = inventory.quantity + quantity;

    inventory.averageRate =
      newQty === 0
        ? 0
        : (inventory.quantity * inventory.averageRate + quantity * rate) /
          newQty;

    inventory.quantity = newQty;
    inventory.lastPurchaseRate = rate;
  }

  /* =========================
     OUT (DN / ISSUE)
  ========================== */
  if (direction === "OUT") {
    if (inventory.quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    inventory.quantity -= quantity;
  }

  await inventory.save({ session });

  /* =========================
     MOVEMENT LOG
  ========================== */
  await StoreStockMovement.create(
    [
      {
        storeId,
        stockId,
        quantity,
        rate,
        direction,
        type,
        referenceType,
        referenceId,
        narration,
        createdBy,
      },
    ],
    { session },
  );

  return inventory;
};

const adjustStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId, stockId, quantity, direction, rate, narration } = req.body;

    await applyStoreStockMovement({
      storeId,
      stockId,
      quantity,
      rate,
      direction,
      type: "ADJUSTMENT",
      referenceType: "Manual",
      narration,
      createdBy: req.user._id,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Stock adjusted" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: err.message });
  }
};

const getStoreInventory = async (req, res) => {
  try {
    const { storeId } = req.params;

    const inventory = await StoreInventory.find({ storeId })
      .populate("stockId", "name unit category")
      .sort({ "stockId.name": 1 });

    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStoreStock = async (req, res) => {
  const data = await StoreInventory.find({
    storeId: req.params.storeId,
  }).populate("stockId");

  res.json(data);
};

const getStockSummary = async (req, res) => {
  const result = await StoreInventory.aggregate([
    {
      $group: {
        _id: null,
        totalQty: { $sum: "$quantity" },
        totalValue: { $sum: "$stockValue" },
      },
    },
  ]);

  res.json(result[0] || { totalQty: 0, totalValue: 0 });
};

const getItemStock = async (req, res) => {
  const data = await StoreInventory.find({
    stockId: req.params.stockId,
  }).populate("storeId");

  res.json(data);
};

module.exports = {
  createStock,
  getStockById,
  getStocks,
  updateStock,
  deleteStock,
  createStockItem,
  getStockItems,
  getStockItemById,
  updateStockItem,
  deleteStockItem,
  createStockGroup,
  getStockGroups,
  updateStockGroup,
  deleteStockGroup,
  applyStoreStockMovement,
  getItemStock,
  getStockSummary,
  getStoreStock,
  adjustStock,
};
