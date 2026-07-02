const express = require("express");
const BusinessUnit = express.Router();
const {
  createBusinessUnit,
  getBusinessUnits,
  getBusinessUnitById,
  updateBusinessUnit,
  deleteBusinessUnit,
  deactivateBusinessUnit,
} = require("../controller/businessunit.controller");

// create BU
BusinessUnit.post("/", createBusinessUnit);

// list all BU
BusinessUnit.get("/", getBusinessUnits);
BusinessUnit.patch("/deactivate/:id", deactivateBusinessUnit);
BusinessUnit.get("/:id", getBusinessUnitById);
BusinessUnit.put("/:id", updateBusinessUnit);
BusinessUnit.delete("/:id", deleteBusinessUnit);

module.exports = BusinessUnit;
