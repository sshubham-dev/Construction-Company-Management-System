const { AssetMaintenance, Asset } = require("../models/assets.models");
const assetService = require("../services/assets.service");

/* =========================
   CREATE ASSET
========================= */
const createAsset = async (req, res) => {
  try {
    const asset = await assetService.createAsset(req.body, req.user._id);

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   GET ASSETS
========================= */
const getAssets = async (req, res) => {
  const data = await Asset.find({ isActive: true })
    .populate("itemId storeId assignedTo")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
};

/* =========================
   UPDATE ASSET
========================= */
const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) throw new Error("Asset not found");

    Object.assign(asset, req.body);

    await asset.save();

    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   DEACTIVATE
========================= */
const deleteAsset = async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) return res.status(404).json({ error: "Not found" });

  asset.isActive = false;
  await asset.save();

  res.json({ success: true });
};



/* =========================
   CREATE MAINTENANCE
========================= */
const createMaintenance = async (req, res) => {
  try {
    const data = await assetService.startMaintenance(req.body);

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   COMPLETE MAINTENANCE
========================= */
const completeMaintenance = async (req, res) => {
  try {
    const data = await assetService.completeMaintenance(req.params.id);

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


module.exports = {
  createAsset,
  getAssets,
  updateAsset,
  deleteAsset,
  createMaintenance,
  completeMaintenance
}