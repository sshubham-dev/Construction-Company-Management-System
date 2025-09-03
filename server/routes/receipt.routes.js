const express = require('express');
const Receipt = express.Router();
const { createReceipt, getAllReceipts, getReceiptById, updateReceipt, deleteReceipt, generateReceiptNo } = require('../controller/receipt.controller');  // Adjust path as needed
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

Receipt.post('/', createReceipt);
Receipt.get('/', getAllReceipts);
Receipt.get('/next-voucher', generateReceiptNo);
Receipt.get('/:id', getReceiptById);
Receipt.put('/:id', updateReceipt);
Receipt.delete('/:id', deleteReceipt);

module.exports = Receipt;
