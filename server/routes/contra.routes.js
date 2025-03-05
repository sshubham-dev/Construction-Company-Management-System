const express = require('express');
const Contra = express.Router();
const { createContra, getAllContra, getContraByVoucherNo, updateContra, deleteContra } = require('../controller/contra.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create Contra voucher
Contra.post('/', userAuth, createContra);

// Get all Contra vouchers
Contra.get('/', getAllContra);

// Get Contra voucher by voucherNo
Contra.get('/:voucherNo', getContraByVoucherNo);

// Update Contra voucher
Contra.put('/:voucherNo', updateContra);

// Delete Contra voucher
Contra.delete('/:voucherNo', deleteContra);

module.exports = Contra;
