const express = require("express");
const Payroll = express.Router();
const {
  createPayroll,
  getPayrolls,
  getPayroll,
  updatePayroll,
  deletePayroll,
  calculate,
} = require("../controller/payroll.controller");
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

// Payroll Routes
Payroll.post("/", createPayroll);
Payroll.post("/calculate", calculate);
Payroll.get("/", getPayrolls);
Payroll.get("/:id", getPayroll);
Payroll.put("/:id", updatePayroll);
Payroll.delete("/:id", deletePayroll);

module.exports = Payroll;
