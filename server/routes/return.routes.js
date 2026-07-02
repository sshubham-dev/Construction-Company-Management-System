const express = require('express');
const Return = express.Router();
const {
    createReturn,
    verifyReturn,
    postReturnController,
    getReturnById,
    getReturns,
    updateReturn,
    deleteReturn,
    getReturnItem,
    updateReturnItem,
} = require('../controller/return.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Create a return
Return.post('/', userAuth, createReturn);

// Get all returns
Return.get('/', getReturns);


// Update a return
Return.put('/verify/:id', verifyReturn);
Return.put('/post/:id', postReturnController);
Return.put('/save/:id', updateReturn);

// Get a return by ID
Return.get('/:id', getReturnById);
Return.get('/:id/item', getReturnItem);

Return.put('/:id', updateReturn);
Return.put('/:id/item/:index', updateReturnItem);

// Delete a return
Return.delete('/:id', deleteReturn);

module.exports = Return;
