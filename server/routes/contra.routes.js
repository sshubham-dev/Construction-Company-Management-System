const express = require("express");
const Contra = express.Router();
const {
  createContra,
  updateContra,
  deleteContra,
  getAllContra,
  getContra,
  getContraByVoucher,
  postContra,
  cancelContra,
} = require("../controller/contra.controller");
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

// Create Contra voucher
Contra.post("/", userAuth, createContra);

// Get all Contra vouchers
Contra.get("/", userAuth, getAllContra);

// Get next voucher number
// Contra.get("/next-voucher", getNextContraNo);

// Get Contra voucher by voucherNo
Contra.get("/:id", userAuth, getContra);

// Get Contra voucher by voucherNo
Contra.get("/:voucherNo", userAuth, getContraByVoucher);

// Update Contra voucher
Contra.put("/post/:id", userAuth, postContra);
Contra.put("/cancel/:id", userAuth, cancelContra);
Contra.put("/:id", userAuth, updateContra);

// Delete Contra voucher
Contra.delete("/:id", userAuth, deleteContra);

module.exports = Contra;
