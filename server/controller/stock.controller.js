const {
  Stock,
  Item,
  Stock_Group,
  Stock_Transaction,
  Stock_Category,
} = require("../models/stock.models");
const { Ledger } = require("../models/ledger.models");
const {
  Store,
} = require("../models/store.models");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");
const { executeStockTransaction, initializeStockForItem } = require("../services/Inventory/stock.service.js");


/* =========================
   CREATE CATEGORY
========================= */
const createCategory = async (req, res) => {
  try {
    const { name, groupId, description } = req.body;

    if (!name) throw new Error("Category name is required");

    // prevent duplicate under same parent
    const exists = await Stock_Category.findOne({
      name: name.trim(),
      groupId: groupId,
      isActive: true,
    });

    if (exists) throw new Error("Category already exists");

    // validate parent
    if (groupId) {
      const parent = await Stock_Group.findById(groupId);
      if (!parent) throw new Error("Invalid Parent Group");
    }

    const category = await Stock_Category.create({
      name: name.trim(),
      groupId: groupId,
      description,
      createdBy: req.user?._id,
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   GET CATEGORIES
========================= */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Stock_Category.find({
      isActive: true,
    }).populate("groupId")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: categories,
    });

  } catch (err) {
    console.log(err);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   GET CATEGORY
========================= */
const getCategoryTree = async (req, res) => {
  try {
    const categories = await Stock_Category.find({ isActive: true }).lean();

    const map = {};
    const roots = [];

    categories.forEach((c) => {
      map[c._id] = { ...c, children: [] };
    });

    categories.forEach((c) => {
      if (c.groupId) {
        map[c.groupId]?.children.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    res.json({ success: true, data: roots });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   GET CATEGORY
========================= */
const getCategoryById = async (req, res) => {
  try {
    const category = await Stock_Category.findById(req.params.id);

    if (!category) throw new Error("Category not found");

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   UPDATE CATEGORY
========================= */
const updateCategory = async (req, res) => {
  try {
    const { name, groupId, description, isActive } = req.body;

    const category = await Stock_Category.findById(req.params.id);
    if (!category) throw new Error("Category not found");

    // prevent duplicate
    if (name) {
      const exists = await Stock_Category.findOne({
        _id: { $ne: category._id },
        name: name.trim(),
        groupId: groupId || category.groupId,
        isActive: true,
      });

      if (exists) throw new Error("Category already exists");

      category.name = name.trim();
    }

    if (groupId !== undefined) category.groupId = groupId;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   DELETE CATEGORY
========================= */
const deleteCategory = async (req, res) => {
  try {
    const category = await Stock_Category.findById(req.params.id);
    if (!category) throw new Error("Category not found");

    // check usage in items
    const used = await Item.exists({ categoryId: category._id });
    if (used) throw new Error("Category is used in items");

    category.isActive = false;
    await category.save();

    res.json({ success: true, message: "Category deactivated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


/* =========================
   CREATE GROUP
========================= */
const createStockGroup = async (req, res) => {
  try {
    const {
      name,
      code,
      affectsInventory,
      isConsumable,
      isAsset,
      defaultPurchaseLedgerId,
      defaultSalesLedgerId,
      defaultExpenseLedgerId,
      description,
    } = req.body;

    if (!name) throw new Error("Name & Code required");

    // uniqueness
    const exists = await Stock_Group.findOne({
      $or: [{ name }, { code }],
      isActive: true,
    });

    if (exists) throw new Error("Group already exists");

    // flag validation
    if (isAsset && isConsumable) {
      throw new Error("Asset cannot be consumable");
    }

    // ledger validation
    // const ledgerIds = [
    //   defaultPurchaseLedgerId,
    //   defaultSalesLedgerId,
    //   defaultExpenseLedgerId,
    // ].filter(Boolean);

    // if (ledgerIds.length) {
    //   const count = await Ledger.countDocuments({ _id: { $in: ledgerIds } });
    //   if (count !== ledgerIds.length) {
    //     throw new Error("Invalid ledger reference");
    //   }
    // }

    const group = await Stock_Group.create({
      name: name.trim(),
      code,
      affectsInventory,
      isConsumable,
      isAsset,
      // defaultPurchaseLedgerId,
      // defaultSalesLedgerId,
      // defaultExpenseLedgerId,
      description,
      isActive: true,
    });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   GET GROUPS
========================= */
const getStockGroups = async (req, res) => {
  try {
    const groups = await Stock_Group.find({ isActive: true }).sort({ name: 1 });

    res.json({ success: true, data: groups });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   GET GROUP BY ID
========================= */
const getStockGroupById = async (req, res) => {
  try {
    const group = await Stock_Group.findById(req.params.id);

    if (!group) throw new Error("Group not found");

    res.json({ success: true, data: group });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   UPDATE GROUP
========================= */
const updateStockGroup = async (req, res) => {
  try {
    const group = await Stock_Group.findById(req.params.id);
    if (!group) throw new Error("Group not found");

    const {
      name,
      code,
      isConsumable,
      isAsset,
      defaultPurchaseLedgerId,
      defaultSalesLedgerId,
      defaultExpenseLedgerId,
    } = req.body;

    // uniqueness check
    if (name || code) {
      const exists = await Stock_Group.findOne({
        _id: { $ne: group._id },
        $or: [{ name }, { code }],
        isActive: true,
      });

      if (exists) throw new Error("Duplicate group");
    }

    // flag validation
    if (isAsset && isConsumable) {
      throw new Error("Asset cannot be consumable");
    }

    Object.assign(group, req.body);

    await group.save();

    res.json({ success: true, data: group });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   DELETE GROUP
========================= */
const deleteStockGroup = async (req, res) => {
  try {
    const group = await Stock_Group.findById(req.params.id);
    if (!group) throw new Error("Group not found");

    // prevent deletion if used
    const used = await Item.exists({ groupId: group._id });
    if (used) throw new Error("Group used in items");

    group.isActive = false;
    await group.save();

    res.json({ success: true, message: "Group deactivated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


/* =========================
   CREATE ITEM
========================= */
const createStockItem = async (req, res) => {
  try {
    const {
      // Basic
      name,
      code,
      description,

      // Classification
      groupId,
      categoryId,
      unit,
      itemType,
      procurementMode,

      // Tax
      hsnSacCode,
      gstRate,
      gstType,

      // Accounting
      purchaseLedgerId,
      salesLedgerId,
      inventoryLedgerId,
      issueLedgerId,

      // Inventory Behaviour
      affectsInventory,
      allowNegativeStock,
      trackBatch,
      trackSerialNo,
      expiryApplicable,

      // Stock Control
      minimumLevel,
      reorderLevel,
      maximumLevel,

      // Purchase
      defaultPurchaseRate,

      // Additional
      brand,
      specification,

      isActive,
    } = req.body;

    if (!purchaseLedgerId)
      return res.status(400).json({ message: "Purchase Ledger is required." });

    if (!salesLedgerId)
      return res.status(400).json({ message: "Sales Ledger is required." });

    if (
      itemType !== "SERVICE" &&
      !inventoryLedgerId
    )
      return res.status(400).json({
        message: "Inventory Ledger is required.",
      });

    if (
      itemType !== "SERVICE" &&
      !issueLedgerId
    )
      return res.status(400).json({
        message: "Issue Ledger is required.",
      });

    const item = await Item.create({
      // Basic
      name: name?.trim(),
      code: code?.trim().toUpperCase(),
      description,

      // Classification
      groupId,
      categoryId,
      unit,
      itemType,
      procurementMode,

      // Tax
      hsnSacCode,
      gstRate,
      gstType,

      // Accounting
      purchaseLedgerId,
      salesLedgerId,
      inventoryLedgerId:
        itemType === "SERVICE" ? null : inventoryLedgerId,
      issueLedgerId:
        itemType === "SERVICE" ? null : issueLedgerId,

      // Inventory Behaviour
      affectsInventory:
        itemType === "SERVICE" ? false : affectsInventory,
      allowNegativeStock:
        itemType === "SERVICE" ? false : allowNegativeStock,
      trackBatch:
        itemType === "SERVICE" ? false : trackBatch,
      trackSerialNo:
        itemType === "SERVICE" ? false : trackSerialNo,
      expiryApplicable:
        itemType === "SERVICE" ? false : expiryApplicable,

      // Stock Control
      minimumLevel:
        itemType === "SERVICE" ? 0 : minimumLevel,
      reorderLevel:
        itemType === "SERVICE" ? 0 : reorderLevel,
      maximumLevel:
        itemType === "SERVICE" ? 0 : maximumLevel,

      // Purchase
      defaultPurchaseRate,

      // Additional
      brand,
      specification,

      isActive,

      createdBy: req.user._id,
    });

    // Create opening stock only for inventory items
    if (item.affectsInventory) {
      console.log("Item Created:", item._id);
      const stores = await Store.find({
        isActive: true,
      });
      if (!stores.length) return;
      console.log("Stores:", stores);
      await initializeStockForItem(
        item._id,
        stores.map((s) => s._id)
      );
      console.log("Stock initialized");
    }

    return res.status(201).json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error(err);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   GET ITEMS
========================= */
const getStockItems = async (req, res) => {
  try {
    const items = await Item.find({ isActive: true })
      .populate("categoryId groupId")
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   GET ITEM BY ID
========================= */
const getStockItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("categoryId groupId");

    if (!item) throw new Error("Item not found");

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   UPDATE ITEM
========================= */
const updateStockItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const {
      // Basic
      name,
      code,
      description,

      // Classification
      groupId,
      categoryId,
      unit,
      itemType,
      procurementMode,

      // Tax
      hsnSacCode,
      gstRate,
      gstType,

      // Accounting
      purchaseLedgerId,
      salesLedgerId,
      inventoryLedgerId,
      issueLedgerId,

      // Inventory Behaviour
      affectsInventory,
      allowNegativeStock,
      trackBatch,
      trackSerialNo,
      expiryApplicable,

      // Stock Control
      minimumLevel,
      reorderLevel,
      maximumLevel,

      // Purchase
      defaultPurchaseRate,

      // Additional
      brand,
      specification,

      // Status
      isActive,
    } = req.body;
    console.log(req.body)

    /* =========================
       VALIDATION
    ========================= */

    if (purchaseLedgerId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Purchase Ledger is required.",
      });
    }

    if (salesLedgerId === undefined) {
      return res.status(400).json({
        success: false,
        message: "Sales Ledger is required.",
      });
    }

    if (itemType !== "SERVICE") {
      if (inventoryLedgerId === undefined) {
        return res.status(400).json({
          success: false,
          message: "Inventory Ledger is required.",
        });
      }

      if (issueLedgerId === undefined) {
        return res.status(400).json({
          success: false,
          message: "Issue Ledger is required.",
        });
      }
    }

    /* =========================
       BASIC
    ========================= */

    item.name = name?.trim();
    item.code = code?.trim().toUpperCase();
    item.description = description;

    /* =========================
       CLASSIFICATION
    ========================= */

    item.groupId = groupId;
    item.categoryId = categoryId;
    item.unit = unit;
    item.itemType = itemType;
    item.procurementMode = procurementMode;

    /* =========================
       TAX
    ========================= */

    item.hsnSacCode = hsnSacCode;
    item.gstRate = gstRate;
    item.gstType = gstType;

    /* =========================
       ACCOUNTING
    ========================= */

    item.purchaseLedgerId = purchaseLedgerId;
    item.salesLedgerId = salesLedgerId;

    item.inventoryLedgerId =
      itemType === "SERVICE" ? null : inventoryLedgerId;

    item.issueLedgerId =
      itemType === "SERVICE" ? null : issueLedgerId;

    /* =========================
       INVENTORY BEHAVIOUR
    ========================= */

    item.affectsInventory =
      itemType === "SERVICE"
        ? false
        : affectsInventory;

    item.allowNegativeStock =
      itemType === "SERVICE"
        ? false
        : allowNegativeStock;

    item.trackBatch =
      itemType === "SERVICE"
        ? false
        : trackBatch;

    item.trackSerialNo =
      itemType === "SERVICE"
        ? false
        : trackSerialNo;

    item.expiryApplicable =
      itemType === "SERVICE"
        ? false
        : expiryApplicable;

    /* =========================
       STOCK CONTROL
    ========================= */

    item.minimumLevel =
      itemType === "SERVICE" ? 0 : minimumLevel;

    item.reorderLevel =
      itemType === "SERVICE" ? 0 : reorderLevel;

    item.maximumLevel =
      itemType === "SERVICE" ? 0 : maximumLevel;

    /* =========================
       PURCHASE
    ========================= */

    item.defaultPurchaseRate = defaultPurchaseRate;

    /* =========================
       ADDITIONAL
    ========================= */

    item.brand = brand;
    item.specification = specification;

    item.isActive = isActive;

    item.updatedBy = req.user?._id;

    await item.save();

    // Create opening stock only for inventory items
    if (item.affectsInventory) {
      console.log("Item Created:", item._id);
      console.log(item.affectsInventory);
      const stores = await Store.find({
        isActive: true,
      });
      if (!stores.length) return;
      console.log("Stores:", stores[0]);
      console.log(initializeStockForItem);
      await initializeStockForItem(
        item._id,
        stores.map((s) => s._id)
      );
      console.log("Stock initialized");
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   DELETE ITEM
========================= */
const deleteStockItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) throw new Error("Item not found");

    item.isActive = false;
    await item.save();

    res.json({ success: true, message: "Item deactivated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


/* =========================
   GET STOCKS 
========================= */
const getStocks = async (req, res) => {
  try {
    const { storeId, itemId } = req.query;

    const filter = { isActive: true };

    if (storeId) filter.storeId = storeId;
    if (itemId) filter.itemId = itemId;

    const stocks = await Stock.find(filter)
      .populate("itemId storeId")
      .lean();

    res.json({ success: true, data: stocks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   GET STOCK
========================= */
const getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id).populate(
      "itemId storeId",
    );

    if (!stock) throw new Error("Stock not found");

    res.json({ success: true, data: stock });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   STOCK SUMMARY
========================= */
const getStockSummary = async (req, res) => {
  try {
    const result = await Stock.aggregate([
      {
        $group: {
          _id: null,
          totalQty: { $sum: "$quantity" },
          totalValue: { $sum: "$stockValue" },
        },
      },
    ]);

    res.json({
      success: true,
      data: result[0] || { totalQty: 0, totalValue: 0 },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   ITEM-WISE STOCK
========================= */
const getItemStock = async (req, res) => {
  try {
    const data = await Stock.find({
      itemId: req.params.itemId,
    }).populate("storeId");

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* =========================
   STORE-WISE STOCK
========================= */
const getStoreStock = async (req, res) => {
  try {
    const data = await Stock.find({
      storeId: req.params.storeId,
    }).populate("itemId");

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


const reserveStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;

    const stock = await Stock.findById(stockId);
    if (!stock) throw new Error("Stock not found");

    const availableQty = stock.quantity - stock.reservedQty;

    if (availableQty < quantity) {
      throw new Error("Insufficient stock");
    }

    stock.reservedQty += quantity;
    stock.availableQty = stock.quantity - stock.reservedQty;

    await stock.save();

    res.json({ success: true, data: stock });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const releaseReservedStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;

    const stock = await Stock.findById(stockId);
    if (!stock) throw new Error("Stock not found");

    stock.reservedQty = Math.max(0, stock.reservedQty - quantity);
    stock.availableQty = stock.quantity - stock.reservedQty;

    await stock.save();

    res.json({ success: true, data: stock });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


/* =========================
   CREATE TRANSACTION
========================= */
const createStockTransaction = async (req, res) => {
  try {
    await executeStockTransaction({
      ...req.body,
      userId: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Stock transaction successful",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   STOCK TRANSACTIONS
========================= */
const getStockTransactions = async (req, res) => {
  try {
    const { itemId, storeId } = req.query;

    const filter = {};

    if (itemId) filter.itemId = itemId;

    if (storeId) {
      filter.$or = [
        { fromStoreId: storeId },
        { toStoreId: storeId },
      ];
    }

    const data = await Stock_Transaction.find(filter)
      .populate("itemId fromStoreId toStoreId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};





module.exports = {
  createStockGroup,
  getStockGroups,
  getStockGroupById,
  updateStockGroup,
  deleteStockGroup,

  createCategory,
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,

  createStockItem,
  getStockItems,
  getStockItemById,
  updateStockItem,
  deleteStockItem,

  getStocks,
  getStockById,
  getStockSummary,
  getItemStock,
  getStoreStock,

  createStockTransaction,
  getStockTransactions,
};
