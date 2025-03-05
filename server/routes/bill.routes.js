const express = require('express');
const Bill = express.Router();
const {
    getBill,
    getBills,
    createBill,
    updateBill,
    deleteBill,
    siteBill,
    saveBill,
    getDraftBills
} = require('../controller/bill.controller.js');
const { userAuth } = require('../middlewares/auth.middleware');

Bill.get('/', getBills);
Bill.get('/site/:id', userAuth, siteBill);
Bill.get('/draft/:id', getDraftBills);
Bill.post('/', userAuth, createBill);
Bill.route('/:id')
.get(getBill)
.put(userAuth, updateBill)
.delete(userAuth, deleteBill);
Bill.put('/save/:id', userAuth, saveBill);
module.exports = Bill;