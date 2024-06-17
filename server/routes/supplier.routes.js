const express = require('express');
const Supplier = express.Router();
const {
    getSupplier,
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controller/supplier.controller.js');

Supplier.get('/', getSuppliers);
Supplier.post('/create', createSupplier);
Supplier.route('/:id')
    .get(getSupplier)
    .put(updateSupplier)
    .delete(deleteSupplier);

module.exports = Supplier;