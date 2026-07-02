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
Bill.post('/', userAuth, createBill);
Bill.get('/site/:id', userAuth, siteBill);
Bill.get('/draft/:id', getDraftBills);
Bill.put('/save/:id', userAuth, saveBill);
// Bill.post('/extra', userAuth, createBill);
// Bill.post('/supply', userAuth, createBill);
Bill.route('/:id')
    .get(getBill)
    .put(userAuth, updateBill)
    .delete(userAuth, deleteBill);
module.exports = Bill;