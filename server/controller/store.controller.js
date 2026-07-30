const {
  Store,
} = require("../models/store.models");
const { Stock, Item } = require("../models/stock.models");
const BusinessUnit = require("../models/businessunit.models");
const Employee = require("../models/employee.models");
const { syncCostCenter } = require("../services/ERP/costcenter.service");


/* =========================
   CREATE STORE
========================= */
const createStore = async (req, res) => {
  try {
    const {
      businessUnitId,
      address,
      storeHead,
      storeIncharge,
      companyId,
      type,
      name,
    } = req.body;

    if (!businessUnitId) throw new Error("Business Unit required");
    if (!storeHead) throw new Error("Store Head required");
    if (!storeIncharge) throw new Error("Store Incharge required");
    if (!type) throw new Error("Store type required");

    if (!["WAREHOUSE", "SITE"].includes(type)) {
      throw new Error("Invalid store type");
    }

    const bu = await BusinessUnit.findById(businessUnitId);
    if (!bu) throw new Error("Invalid Business Unit");

    const [head, incharge] = await Promise.all([
      Employee.findById(storeHead),
      Employee.findById(storeIncharge),
    ]);

    if (!head || !incharge) throw new Error("Invalid employee");

    const city = address?.city || "NA";

    const finalName = name || `${bu.name} ${type} - ${city}`;

    const finalCode =
      (`STR-${bu.code}-${city.substring(0, 3)}`)
        .toUpperCase()
        .trim();

    const exists = await Store.findOne({ code: finalCode });
    if (exists) throw new Error("Store code already exists");

    const store = await Store.create({
      name: finalName,
      code: finalCode,
      type,
      businessUnitId,
      companyId,
      address,
      storeHead,
      storeIncharge,
    });

    const costCenter = await syncCostCenter(store, "WAREHOUSE");
    store.costCenterId = costCenter._id;
    await store.save();

    /* =========================
       AUTO CREATE STOCK
    ========================== */
    const items = await Item.find({ isActive: true }).select("_id");

    if (items.length) {
      const bulk = items.map((item) => ({
        insertOne: {
          document: {
            itemId: item._id,
            storeId: store._id,
            quantity: 0,
            reservedQty: 0,
            avgRate: 0,
            stockValue: 0,
            isActive: true,
          },
        },
      }));

      try {
        await Stock.bulkWrite(bulk, { ordered: false });
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }

    res.status(201).json({ success: true, data: store });

  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};


/* =========================
   GET STORES
========================= */
const getStores = async (req, res) => {
  try {
    const { type, businessUnitId, companyId } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (businessUnitId) filter.businessUnitId = businessUnitId;
    if (companyId) filter.companyId = companyId;

    const stores = await Store.find(filter)
      .populate("businessUnitId storeHead storeIncharge")
      .sort({ createdAt: -1 })

    res.json({ success: true, data: stores });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};



/* =========================
   GET STORE BY ID
========================= */
const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate("businessUnitId storeHead storeIncharge costCenterId companyId");

    if (!store) throw new Error("Store not found");

    res.json({ success: true, data: store });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};


/* =========================
   UPDATE STORE
========================= */
const updateStore = async (req, res) => {
  try {
    const user = req.user;
    const store = await Store.findById(req.params.id);
    if (!store) throw new Error("Store not found");

    Object.assign(store, req.body);
    store.companyId = user?.companyId;

    if (!store.costCenterId) {
      const costCenter = await syncCostCenter(store, "WAREHOUSE");
      store.costCenterId = costCenter._id;
    }
    await store.save();

    res.json({ success: true, data: store });
  } catch (err) {
    console.log(err)
    res.status(400).json({ success: false, message: err.message });
  }
};



/* =========================
   DEACTIVATE STORE
========================= */
const deactivateStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) throw new Error("Store not found");

    const hasStock = await Stock.exists({
      storeId: store._id,
      quantity: { $gt: 0 },
    });

    if (hasStock) {
      throw new Error("Cannot deactivate store with stock");
    }

    store.isActive = false;
    await store.save();

    res.json({ success: true, message: "Store deactivated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deactivateStore,
};