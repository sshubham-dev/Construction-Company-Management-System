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
BusinessUnit.get("/:id", getBusinessUnitById);
BusinessUnit.put("/:id", updateBusinessUnit);
BusinessUnit.patch("/deactivate/:id", deactivateBusinessUnit);
BusinessUnit.delete("/:id", deleteBusinessUnit);

module.exports = BusinessUnit;
