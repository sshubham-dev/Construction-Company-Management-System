const express = require('express');
const Receipt = express.Router();
const {   createReceipt,
  updateReceipt,
  getAllReceipts,
  getReceiptById,
  deleteReceipt,
  postReceipt,
  cancelReceipt,
 } = require('../controller/receipt.controller');  // Adjust path as needed
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');


Receipt.get('/', userAuth, getAllReceipts);
Receipt.post('/', userAuth, createReceipt);
Receipt.put('/post/:id', userAuth, postReceipt);
Receipt.put('/cancel/:id', userAuth, cancelReceipt);
// Receipt.get('/next-voucher', generateReceiptNo);
Receipt.get('/:id', userAuth, getReceiptById);
Receipt.put('/:id', userAuth, updateReceipt);
Receipt.delete('/:id', userAuth, deleteReceipt);

module.exports = Receipt;
