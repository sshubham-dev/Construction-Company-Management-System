const express = require('express');
const Contractor = express.Router();
const { getContractors, getContractor, createContractor, updateContractor, deleteContractor } = require('../controller/contractor.controller');
const { userAuth } = require('../middlewares/auth.middleware');

Contractor.route('/')
    .get(userAuth, getContractors)
    .post(userAuth, createContractor);
Contractor.route('/:id').get(userAuth, getContractor).put(userAuth, updateContractor).delete(userAuth, deleteContractor);

module.exports = Contractor;
