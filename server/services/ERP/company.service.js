const Company = require("../../models/company.models");
const { createDefaultCOA } = require("./coa.service");

// ✅
const createCompany = async (data) => {
  const company = await Company.create(data);

  // 🔥 auto create COA
  await createDefaultCOA(company._id);

  return company;
};

// ✅
const getCompanies = async () => {
  return await Company.find().sort({ createdAt: -1 });
};

const getCompanyById = async (id) => {
  return await Company.findById(id);
};

// ✅
const updateCompany = async (id, data) => {
  return await Company.findByIdAndUpdate(id, data,);
};

const deleteCompany = async (id) => {
  return await Company.findByIdAndUpdate(id, { isActive: false });
};

module.exports = { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany };