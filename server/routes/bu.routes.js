const express = require("express");
const BusinessUnit = express.Router();
const {
  createBusinessUnit,
  getBusinessUnits,
  getBU,
  updateBU,
  deleteBU,
} = require("../controller/businessunit.controller");

// create BU
BusinessUnit.post("/", createBusinessUnit);

// list all BU
BusinessUnit.get("/", getBusinessUnits);
BusinessUnit.get("/:id", getBU);
BusinessUnit.put("/:id", updateBU);
BusinessUnit.delete("/:id", deleteBU);

module.exports = BusinessUnit;
