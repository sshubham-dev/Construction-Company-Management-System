const express = require('express');
const Approval = express.Router();
const {
    getAllApprovals,
    getApprovalById,
    approve,
    getAllApproved,
    deleteApproved,
    reject,
    getAllRejects
} = require('../controller/approval.controller.js');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

Approval.get('/pending/user/:id', getAllApprovals);
Approval.get('/rejected/user/:id', getAllRejects);
Approval.get('/approved/user/:id', getAllApproved);
Approval.delete('/:id', deleteApproved);
Approval.put('/:id', userAuth, approve);
Approval.put('/reject/:id', userAuth, reject);
Approval.get('/pending/:id', getApprovalById);


module.exports = Approval;