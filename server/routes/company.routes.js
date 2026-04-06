const Company = require("express").Router();
const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require("../controller/company.controller");

Company.post("/", create);
Company.get("/", getAll);
Company.get("/:id", getOne);
Company.put("/:id", update);
Company.delete("/:id", remove);

module.exports = Company;
