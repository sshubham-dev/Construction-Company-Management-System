const {Store} = require("../models/store.models");
const BusinessUnit = require("../models/businessunit.models");

const createStore = async (req, res) => {
  try {
    const {
      businessUnitId,
      address,

      // ---- new model ----
      storeHead,
      storeIncharge,
      helper,

      managesConsumables,
      managesAssets,
      allowOfficeItemIssue,
      allowInternalSalesToSites,
      allowDirectSalesToClients,

      stockValuationMethod,
      defaultConsumableRateSource,
      gstRate,

      minimumStockAlert,
      assetTrackingEnabled,

      expenseCategories,
    } = req.body;

    // --------------------
    // Validate Business Unit
    // --------------------
    const bu = await BusinessUnit.findById(businessUnitId);
    if (!bu) {
      return res.status(400).json({ error: "Invalid Business Unit" });
    }

    // --------------------
    // Validate mandatory roles
    // --------------------
    if (!storeHead) {
      return res.status(400).json({ error: "Store Head is required" });
    }

    if (!storeIncharge) {
      return res.status(400).json({ error: "Store Incharge is required" });
    }

    // --------------------
    // Generate name & code
    // --------------------
    const city = address?.city || "NA";

    const name = `${bu.name} Store - ${city}`;
    const code = `STR-${bu.code}-${city.substring(0, 3).toUpperCase()}`;

    // --------------------
    // Create Store
    // --------------------
    const store = new Store({
      name,
      code,
      businessUnitId,
      address,

      storeHead,
      storeIncharge,
      helper: helper || null,

      managesConsumables,
      managesAssets,
      allowOfficeItemIssue,
      allowInternalSalesToSites,
      allowDirectSalesToClients,

      stockValuationMethod,
      defaultConsumableRateSource,
      gstRate,

      minimumStockAlert,
      assetTrackingEnabled,

      expenseCategories,
    });

    const newStore = await store.save();

    res.status(201).json(newStore);
  } catch (err) {
    console.error("Create Store Error:", err);
    res.status(500).json({ error: "Store creation failed" });
  }
};

const getStores = async (req, res) => {
  const stores = await Store.find({ isActive: true })
    .populate("businessUnitId", "name code")
    .sort({ createdAt: -1 });

  res.json(stores);
};

const getStoreById = async (req, res) => {
  const store = await Store.findById(req.params.id)
    .populate("businessUnitId")
    .exec();
    // .populate("ledgerId");

  if (!store) return res.status(404).json({ message: "Store not found" });

  res.json(store);
};

const updateStore = async (req, res) => {
  try {
    const data = req.body;

    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // --------------------
    // Prevent BU change
    // --------------------
    if (
      data.businessUnitId &&
      data.businessUnitId !== store.businessUnitId.toString()
    ) {
      return res.status(400).json({
        error: "Business Unit cannot be changed once assigned",
      });
    }

    // --------------------
    // Controlled field updates
    // --------------------
    const updatableFields = [
      "address",

      "storeHead",
      "storeIncharge",
      "helper",

      "managesConsumables",
      "managesAssets",
      "allowOfficeItemIssue",
      "allowInternalSalesToSites",
      "allowDirectSalesToClients",

      "stockValuationMethod",
      "defaultConsumableRateSource",
      "gstRate",

      "minimumStockAlert",
      "assetTrackingEnabled",

      "expenseCategories",
    ];

    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        store[field] = data[field];
      }
    });

    // --------------------
    // Mandatory role validation (post-update)
    // --------------------
    if (!store.storeHead) {
      return res.status(400).json({ error: "Store Head is required" });
    }

    if (!store.storeIncharge) {
      return res.status(400).json({ error: "Store Incharge is required" });
    }

    const updated = await store.save();

    res.json(updated);
  } catch (err) {
    console.error("Store Update Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const deactivateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json({ message: "Store deactivated", store });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deactivateStore,
};
