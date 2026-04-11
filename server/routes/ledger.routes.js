const express = require("express");
const Ledger = express.Router();
const Group = express.Router();
const CostCenter = express.Router();
const {
  create,
  getAll,
  getOne,
  update,
  remove,

  createGroup,
  getGroups,
  updateGroup,

  createCostCenter,
  getCostCenters,
  updateCostCenter,
  deleteCostCenter,
} = require("../controller/ledger.controller"); // Adjust the path as necessary

const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

Ledger.route("/").get(userAuth, getAll).post(userAuth, create);
Ledger.route("/:id").get(userAuth, getOne).put(userAuth, update).delete(userAuth, remove);
// Ledger.route("/map/:id").put(mapLedger);

Group.route("/").get(userAuth,getGroups).post(userAuth,createGroup);
Group.route("/:id").put(userAuth,updateGroup);

CostCenter.route("/").get(userAuth,getCostCenters).post(userAuth,createCostCenter);
CostCenter.route("/:id").put(userAuth,updateCostCenter).delete(userAuth,deleteCostCenter);

module.exports = { Ledger, Group, CostCenter };
