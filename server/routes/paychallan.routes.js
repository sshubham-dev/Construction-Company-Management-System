const express = require("express");
const PayChallan = express.Router();
const {
  createChallan,
  updateChallan,
  getAllChallans,
  getChallanById,
  deleteChallan,
  sendForApproval,
  payChallanItem,
  assignChallan,
} = require("../controller/paymentchallan.controller");
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

PayChallan.route("/").get(getAllChallans).post(adminAuth, createChallan);
PayChallan.patch("/approval/:id", adminAuth, sendForApproval);
PayChallan.put("/paid/:id", payChallanItem);
PayChallan.put("/assign/:id", assignChallan);
PayChallan.route("/:id")
  .get(getChallanById)
  .put(adminAuth, updateChallan)
  .delete(adminAuth, deleteChallan);

module.exports = PayChallan;
