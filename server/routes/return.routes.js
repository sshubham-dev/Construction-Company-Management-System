const express = require('express');
const Return = express.Router();
const { createReturn, getReturnById, getReturns, updateReturn, deleteReturn } = require('../controller/return.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create a return
Return.post('/', createReturn);

// Get all returns
Return.get('/', getReturns);

// Get a return by ID
Return.get('/:id', getReturnById);

// Update a return
Return.put('/:id', updateReturn);

// Delete a return
Return.delete('/:id', deleteReturn);

module.exports = Return;
