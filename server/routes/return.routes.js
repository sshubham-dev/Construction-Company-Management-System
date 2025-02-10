const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

// Create a return
router.post('/returns', returnController.createReturn);

// Get all returns
router.get('/returns', returnController.getReturns);

// Get a return by ID
router.get('/returns/:id', returnController.getReturnById);

// Update a return
router.put('/returns/:id', returnController.updateReturn);

// Delete a return
router.delete('/returns/:id', returnController.deleteReturn);

module.exports = router;
