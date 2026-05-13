const { AssetIssue } = require("../models/assets.models");
const assetService = require("../services/assets.service");

/* =========================
   ISSUE
========================= */
const issueAsset = async (req, res) => {
  try {
    const issue = await assetService.issueAsset(req.body, req.user._id);

    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   RETURN
========================= */
const returnAsset = async (req, res) => {
  try {
    const issue = await assetService.returnAsset(
      req.params.id,
      req.body
    );

    res.json({ success: true, data: issue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   GET ISSUES
========================= */
const getAssetIssues = async (req, res) => {
  const data = await AssetIssue.find()
    .populate("assetId issuedTo issuedBy")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
};

module.exports = {
  issueAsset,
  returnAsset,
  getAssetIssues
}