const express = require('express');
const Contractor = express.Router();
const { getContractors, getContractor, createContractor, updateContractor, deleteContractor } = require('../controller/contractor.controller');

Contractor.route('/')
    .get(getContractors)
    .post(createContractor);
Contractor.route('/:id').get(getContractor).put(updateContractor).delete(deleteContractor);

module.exports = Contractor;
