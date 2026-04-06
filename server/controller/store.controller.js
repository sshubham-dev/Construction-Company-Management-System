const mongoose = require("mongoose");
const {
  Store,
  StoreInventory,
  StoreStockMovement,
} = require("../models/store.models");
const BusinessUnit = require("../models/businessunit.models");

/* =====================================
   CREATE STORE
===================================== */
const createStore = async (req, res) => {
  try {
    const { businessUnitId, address, storeHead, storeIncharge, helper, companyId } =
      req.body;

    if (!businessUnitId) throw new Error("Business Unit required");
    if (!storeHead) throw new Error("Store Head required");
    if (!storeIncharge) throw new Error("Store Incharge required");

    const bu = await BusinessUnit.findById(businessUnitId);
    if (!bu) throw new Error("Invalid Business Unit");

    const city = address?.city || "NA";

    const name = `${bu.name} Store - ${city}`;
    const code = `STR-${bu.code}-${city.substring(0, 3).toUpperCase()}`;

    const store = await Store.create({
      name,
      code,
      businessUnitId,
      address,

      storeHead,
      storeIncharge,
      helper: helper || null,

      isActive: true,
      companyId
    });

    res.status(201).json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET STORES
===================================== */
const getStores = async (req, res) => {
  const data = await Store.find({ isActive: true })
    .populate("businessUnitId")
    .sort({ createdAt: -1 });

  res.json(data);
};

const getStore = async (req, res) => {
  const data = await Store.find({ isActive: true })
    .populate("businessUnitId")
    .sort({ createdAt: -1 });

  res.json(data);
};

/* =====================================
   GET STORE BY ID
===================================== */
const getStoreById = async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) return res.status(404).json({ error: "Not found" });

  res.json(store);
};

/* =====================================
   UPDATE STORE
===================================== */
const updateStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) throw new Error("Store not found");

    if (
      req.body.businessUnitId &&
      req.body.businessUnitId !== store.businessUnitId.toString()
    ) {
      throw new Error("Cannot change Business Unit");
    }

    Object.keys(req.body).forEach((key) => {
      store[key] = req.body[key];
    });

    if (!store.storeHead) throw new Error("Store Head required");
    if (!store.storeIncharge) throw new Error("Store Incharge required");

    await store.save();

    res.json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   DEACTIVATE STORE
===================================== */
const deactivateStore = async (req, res) => {
  const store = await Store.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!store) return res.status(404).json({ error: "Not found" });

  res.json({ message: "Store deactivated", store });
};

module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deactivateStore,
  getStore
};
