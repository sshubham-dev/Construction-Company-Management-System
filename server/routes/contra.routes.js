const express = require('express');
const Contra = express.Router();
const { createContra, getAllContra, getContraByVoucherNo, updateContra, deleteContra, getContra } = require('../controller/contra.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create Contra voucher
Contra.post('/', createContra);

// Get all Contra vouchers
Contra.get('/', getAllContra);

// Get Contra voucher by voucherNo
Contra.get('/:id', getContra);

// Get Contra voucher by voucherNo
Contra.get('/:voucherNo', getContraByVoucherNo);

// Update Contra voucher
Contra.put('/:id', updateContra);

// Delete Contra voucher
Contra.delete('/:id', deleteContra);

module.exports = Contra;
