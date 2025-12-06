const Store = require("../models/store.models");
const BusinessUnit = require("../models/businessunit.models");

const createStore = async (req, res) => {
  try {
    const data = req.body;

    if (!data.businessUnitId)
      return res.status(400).json({ error: "Business Unit is required" });

    // Validate BU exists
    const bu = await BusinessUnit.findById(data.businessUnitId);
    if (!bu) return res.status(404).json({ error: "Business Unit not found" });

    // Check if BU already has a store
    const existingStore = await Store.findOne({
      businessUnitId: data.businessUnitId,
    });

    if (existingStore)
      return res
        .status(400)
        .json({ error: "Store already exists for this Business Unit" });

    // Auto create Ledger for Store
    const ledger = new Ledger({
      name: `${bu.name} Store Ledger`,
      under: "Store Accounts",
      referenceType: "Store",
    });
    const ledgerSaved = await ledger.save();

    const newStore = new Store({
      ...data,
      ledgerId: ledgerSaved._id,
    });

    const saved = await newStore.save();

    res.status(201).json(saved);
  } catch (err) {
    console.log("Create Store Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate("businessUnitId", "name code")
      .populate("staff", "name phone")
      .populate("ledgerId", "name");

    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate("businessUnitId", "name code address")
      .populate("staff", "name phone email")
      .populate("ledgerId");

    if (!store) return res.status(404).json({ error: "Store not found" });

    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateStore = async (req, res) => {
  try {
    const data = req.body;

    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });

    // Prevent changing BU
    if (data.businessUnitId && data.businessUnitId !== store.businessUnitId.toString()) {
      return res
        .status(400)
        .json({ error: "Business Unit cannot be changed once assigned" });
    }

    // Merge expense categories
    if (data.expenseCategories) {
      store.expenseCategories = data.expenseCategories;
    }

    // Merge staff
    if (data.staff) {
      store.staff = data.staff;
    }

    // Merge price list
    if (data.priceList) {
      store.priceList = data.priceList;
    }

    // Merge all other fields
    Object.assign(store, data);

    const updated = await store.save();

    res.json(updated);
  } catch (err) {
    console.log("Store Update Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: "Store not found" });

    // Optional: prevent deleting active store with stock
    if (store.currentStockValue > 0) {
      return res.status(400).json({
        error: "Cannot delete store with active stock value",
      });
    }

    await Ledger.findByIdAndDelete(store.ledgerId);
    await Store.findByIdAndDelete(req.params.id);

    res.json({ message: "Store deleted successfully" });
  } catch (err) {
    console.log("Delete Store Error:", err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
};