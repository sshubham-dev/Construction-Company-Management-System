const express = require('express');
const router = express.Router();
const contraController = require('../controllers/contraController');

// Create Contra voucher
router.post('/create', contraController.createContra);

// Get all Contra vouchers
router.get('/', contraController.getAllContra);

// Get Contra voucher by voucherNo
router.get('/:voucherNo', contraController.getContraByVoucherNo);

// Update Contra voucher
router.put('/:voucherNo', contraController.updateContra);

// Delete Contra voucher
router.delete('/:voucherNo', contraController.deleteContra);

module.exports = router;
