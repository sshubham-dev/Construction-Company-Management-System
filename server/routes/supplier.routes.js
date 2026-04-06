const express = require('express');
const Supplier = express.Router();
const {
    getSupplier,
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controller/supplier.controller.js');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

Supplier.get('/', userAuth, getSuppliers);
Supplier.post('/', userAuth, createSupplier);
Supplier.route('/:id')
    .get(getSupplier)
    .put(userAuth,updateSupplier)
    .delete(deleteSupplier);

module.exports = Supplier;