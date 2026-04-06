// services/costCenter.service.js

const { CostCenter } = require("../../models/ledger.models");

const createCostCenter = async (data) => {
  return await CostCenter.create(data);
};

const getCostCenters = async (companyId) => {
  return await CostCenter.find({ companyId }).sort({ createdAt: -1 }).populate("companyId").exec();
};

const updateCostCenter = async (id, data) => {
  return await CostCenter.findByIdAndUpdate(id, data);
};

const deleteCostCenter = async (id) => {
  return await CostCenter.findByIdAndUpdate(id, { isActive: false });
};

const syncCostCenterForSite = async (site, type) => {
  let costCenter = await CostCenter.findOne({
    companyId: site.companyId,
    name: site.name,
  });

  if (!costCenter) {
    switch (type) {
      case "SITE":
        costCenter = await CostCenter.create({
          name: site.name,
          companyId: site.companyId,
          type: "SITE",
          reference: site._id,
        });
        break;
      case "STORE":
        costCenter = await CostCenter.create({
          name: site.name,
          companyId: site.companyId,
          type: "STORE",
          reference: site._id,
        });
        break;

      default:
        break;
    }
  } else {
    costCenter.name = site.name;
    await costCenter.save();
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
