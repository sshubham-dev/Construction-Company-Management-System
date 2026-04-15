// services/costCenter.service.js

const { CostCenter } = require("../../models/ledger.models");

// ✅
const createCostCenter = async (data) => {
  return await CostCenter.create(data);
};

// ✅
const getCostCenters = async (companyId) => {
  return await CostCenter.find().sort({ createdAt: -1 }).populate("companyId").exec();
};

const updateCostCenter = async (id, data) => {
  return await CostCenter.findByIdAndUpdate(id, data);
};

const deleteCostCenter = async (id) => {
  return await CostCenter.findByIdAndUpdate(id, { isActive: false });
};

// ✅
const syncCostCenterForSite = async (site, type) => {
  console.log("Finding cost center for", type);

  let costCenter = await CostCenter.findOne({
    companyId: site.companyId,
    reference: site._id, // 🔥 IMPORTANT (not name)
    type,
  });

  if (!costCenter) {
    console.log("Creating cost center for", type);

    costCenter = await CostCenter.create({
      name: site.name,
      companyId: site.companyId,
      type,
      reference: site._id,
    });
  } else {
    // update name if changed
    if (costCenter.name !== site.name) {
      costCenter.name = site.name;
      await costCenter.save();
    }
  }

  return costCenter;
};

module.exports = {
  createCostCenter,
  getCostCenters,
  updateCostCenter,
  deleteCostCenter,
  syncCostCenterForSite,
};
