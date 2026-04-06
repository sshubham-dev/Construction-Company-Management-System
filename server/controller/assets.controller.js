const mongoose = require("mongoose");
const {StoreInventory} = require("../models/store.models")
const {
  Asset,
  AssetIssue,
  AssetMaintenance,
} = require("../models/assets.models");


const createAsset = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name) throw new Error("Name required");

    const exists = await Asset.findOne({ name: data.name });
    if (exists) throw new Error("Asset already exists");

    const asset = await Asset.create(data);

    res.status(201).json(asset);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const addAssetToStore = async (req, res) => {
  try {
    const { storeId, assetId, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    let inventory = await StoreInventory.findOne({
      storeId,
      stockId,
    });

    if (!inventory) {
      inventory = new StoreInventory({
        storeId,
        stockId,
        totalQuantity: 0,
      });
    }

    inventory.totalQuantity += quantity;

    await inventory.save();

    res.json(inventory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const issueAsset = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;

    const {
      assetId,
      storeId,
      issuedToType,
      issuedToId,
      issuedToName,
      quantity,
      expectedReturnDate,
    } = req.body;

    const inventory = await StoreInventory.findOne({
      storeId,
      assetId,
    }).session(session);

    if (!inventory || inventory.availableQuantity < quantity) {
      throw new Error("Insufficient asset quantity");
    }

    const asset = await Asset.findById(assetId).session(session);

    /* ===== UPDATE INVENTORY ===== */
    inventory.issuedQuantity += quantity;
    await inventory.save({ session });

    /* ===== CREATE ISSUE ===== */
    const issue = await AssetIssue.create(
      [
        {
          assetId,
          storeId,
          issuedToType,
          issuedToId,
          issuedToName,
          quantity,
          expectedReturnDate,
          rentPerDay: asset?.rentPerDay || 0,
          createdBy: user._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json(issue[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ error: err.message });
  }
};

const returnAsset = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { returnCondition } = req.body;

    const issue = await AssetIssue.findById(req.params.id).session(session);

    if (!issue) throw new Error("Issue not found");

    if (issue.status !== "Issued") {
      throw new Error("Already processed");
    }

    const inventory = await StoreInventory.findOne({
      storeId: issue.storeId,
      stockId: issue.stockId,
    }).session(session);

    /* ===== UPDATE INVENTORY ===== */
    inventory.issuedQuantity -= issue.quantity;

    if (returnCondition === "Damaged" || returnCondition === "Scrap") {
      inventory.damagedQuantity += issue.quantity;
    }

    await inventory.save({ session });

    /* ===== UPDATE ISSUE ===== */
    issue.status = "Returned";
    issue.returnCondition = returnCondition;
    issue.actualReturnDate = new Date();

    await issue.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Asset returned successfully",
      issue,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: err.message });
  }
};

const markAssetLost = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const issue = await AssetIssue.findById(req.params.id).session(session);

    if (!issue) throw new Error("Issue not found");

    if (issue.status !== "Issued") {
      throw new Error("Invalid status");
    }

    const inventory = await StoreInventory.findOne({
      storeId: issue.storeId,
      stockId: issue.stockId,
    }).session(session);

    inventory.issuedQuantity -= issue.quantity;
    inventory.damagedQuantity += issue.quantity;

    await inventory.save({ session });

    issue.status = "Lost";
    await issue.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Marked as lost" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: err.message });
  }
};

const addMaintenance = async (req, res) => {
  try {
    const { assetId, issueId, type, cost, remarks } = req.body;

    const maintenance = await AssetMaintenance.create({
      assetId,
      issueId,
      type,
      cost,
      remarks,
    });

    res.status(201).json(maintenance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getStoreAssets = async (req, res) => {
  const data = await StoreInventory.find({
    storeId: req.params.storeId,
  }).populate("assetId");

  res.json(data);
};

const getAssetIssues = async (req, res) => {
  const today = new Date();

  const issues = await AssetIssue.find();

  const updated = issues.map((i) => {
    if (
      i.status === "Issued" &&
      i.expectedReturnDate &&
      i.expectedReturnDate < today
    ) {
      i.status = "Overdue";
    }
    return i;
  });

  res.json(updated);
};

const getOverdueAssets = async (req, res) => {
  const today = new Date();

  const data = await AssetIssue.find({
    status: { $in: ["Issued", "Overdue"] },
    expectedReturnDate: { $lt: today },
  }).populate("assetId");

  res.json(data);
};


const calculatePenalty = (issue) => {
  if (!issue.rentPerDay || issue.status !== "Overdue") return 0;

  const days =
    (new Date() - issue.expectedReturnDate) /
    (1000 * 60 * 60 * 24);

  return Math.ceil(days) * issue.rentPerDay;
};

const markOverdueAssets = async () => {
  const today = new Date();

  const overdueIssues = await AssetIssue.find({
    status: "Issued",
    expectedReturnDate: { $lt: today },
  });

  if (!overdueIssues.length) return;

  const bulkOps = overdueIssues.map((issue) => ({
    updateOne: {
      filter: { _id: issue._id },
      update: { status: "Overdue" },
    },
  }));

  await AssetIssue.bulkWrite(bulkOps);

  return overdueIssues.length;
};

const cron = require("node-cron");
// const { markOverdueAssets } = require("./services/asset.service");

cron.schedule("0 1 * * *", async () => {
  console.log("Running overdue asset check...");

  const count = await markOverdueAssets();

  console.log(`Overdue updated: ${count}`);
});

module.exports = {
  createAsset,
  addAssetToStore,
  issueAsset,
  returnAsset,
  markAssetLost,
  addMaintenance,
  getStoreAssets,
  getAssetIssues,
  getOverdueAssets
};