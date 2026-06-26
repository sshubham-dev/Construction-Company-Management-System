// services/costCenter.service.js

const { CostCenter } = require("../../models/ledger.models");

// ✅
const createCostCenter = async (data) => {
  return await CostCenter.create(data);
};

// ✅
const getCostCenters = async (companyId) => {
  return await CostCenter.find()
    .sort({ name: 1 })
    .populate("companyId parentId")
    .exec();
};

const updateCostCenter = async (id, data) => {
  return await CostCenter.findByIdAndUpdate(id, data);
};

const deleteCostCenter = async (id) => {
  return await CostCenter.findByIdAndUpdate(id, { isActive: false });
};

// ✅
const syncCostCenter = async (store, type) => {
  const filter = {
    companyId: store.companyId,
    reference: store._id,
    name: store.name,
  };

  const update = {
    $setOnInsert: {
      companyId: store.companyId,
      reference: store._id,
      type: type,
    },
    $set: {
      name: store.name,
    },
  };

  try {
    const costCenter = await CostCenter.findOneAndUpdate(
      filter,
      update,
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    if (!costCenter) {
      // fallback (rare case)
      const existing = await CostCenter.findOne(filter);
      if (existing) return existing;

      throw new Error("CostCenter creation failed");
    }

    return costCenter;

  } catch (err) {
    if (err.code === 11000) {
      // duplicate race condition
      const existing = await CostCenter.findOne(filter);
      if (existing) return existing;
    }

    throw err;
  }
};

module.exports = {
  createCostCenter,
  getCostCenters,
  updateCostCenter,
  deleteCostCenter,
  syncCostCenter,
};
