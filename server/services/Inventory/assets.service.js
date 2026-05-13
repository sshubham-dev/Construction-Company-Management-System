const mongoose = require("mongoose");
const { Asset, AssetIssue } = require("../models/assets.models");


async function generateAssetCode() {
  const last = await Asset.findOne().sort({ createdAt: -1 });

  if (!last) return "AST-0001";

  const num = parseInt(last.code.split("-")[1]) || 0;
  return `AST-${String(num + 1).padStart(4, "0")}`;
}

/* =========================
   CREATE ASSET
========================= */
async function createAsset(data, userId) {
  const code = await generateAssetCode();

  return await Asset.create({
    ...data,
    code,
    createdBy: userId,
  });
};

/* =========================
   ISSUE ASSET
========================= */
async function issueAsset(data, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const asset = await Asset.findById(data.assetId).session(session);

    if (!asset) throw new Error("Asset not found");

    if (asset.status !== "AVAILABLE") {
      throw new Error("Asset not available");
    }

    const issue = await AssetIssue.create([{
      ...data,
      issuedBy: userId,
      rentPerDay: asset.rentPerDay || 0,
    }], { session });

    asset.status = "ISSUED";
    asset.assignedTo = data.issuedTo;

    await asset.save({ session });

    await session.commitTransaction();
    session.endSession();

    return issue[0];

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* =========================
   RETURN ASSET
========================= */
async function returnAsset(issueId, data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const issue = await AssetIssue.findById(issueId).session(session);

    if (!issue) throw new Error("Issue not found");

    if (issue.status !== "ISSUED") {
      throw new Error("Already returned");
    }

    issue.returnedAt = new Date();
    issue.returnCondition = data.returnCondition;
    issue.status = "RETURNED";

    await issue.save({ session });

    const asset = await Asset.findById(issue.assetId).session(session);

    asset.status = "AVAILABLE";
    asset.assignedTo = null;

    await asset.save({ session });

    await session.commitTransaction();
    session.endSession();

    return issue;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* =========================
   MARK OVERDUE
========================= */
async function markOverdue() {
  const today = new Date();

  const issues = await AssetIssue.find({
    status: "ISSUED",
    expectedReturnDate: { $lt: today },
  });

  for (const issue of issues) {
    issue.status = "OVERDUE";
    await issue.save();
  }

  return issues.length;
}

/* =========================
   START MAINTENANCE
========================= */
async function startMaintenance(data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const asset = await Asset.findById(data.assetId).session(session);

    if (!asset) throw new Error("Asset not found");

    if (asset.status === "ISSUED") {
      throw new Error("Cannot maintain issued asset");
    }

    const maintenance = await AssetMaintenance.create([data], { session });

    asset.status = "MAINTENANCE";
    await asset.save({ session });

    await session.commitTransaction();
    session.endSession();

    return maintenance[0];

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* =========================
   COMPLETE MAINTENANCE
========================= */
async function completeMaintenance(id) {
  const record = await AssetMaintenance.findById(id);

  if (!record) throw new Error("Not found");

  await Asset.findByIdAndUpdate(record.assetId, {
    status: "AVAILABLE",
  });

  return record;
};



module.exports = {
  createAsset,
  issueAsset,
  returnAsset,
  markOverdue,
  startMaintenance,
  completeMaintenance
};