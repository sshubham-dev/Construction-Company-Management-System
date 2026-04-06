const companyService = require("../services/ERP/company.service");

const create = async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json(company);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  const data = await companyService.getCompanies();
  res.json(data);
};

const getOne = async (req, res) => {
  const data = await companyService.getCompanyById(req.params.id);
  res.json(data);
};

const update = async (req, res) => {
  try {
    const data = await companyService.updateCompany(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  await companyService.deleteCompany(req.params.id);
  res.json({ message: "Deleted" });
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};
