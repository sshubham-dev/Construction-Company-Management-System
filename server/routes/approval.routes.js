const express = require('express');
const Approval = express.Router();
const {
    getAllApprovals,
    getApprovalById,
    approve,
    getAllApproved,
    deleteApproved,
    reject,
    getAllRejects,
    deleteApproval,
} = require('../controller/approval.controller.js');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

Approval.get('/pending/user/:id', userAuth, getAllApprovals);
Approval.get('/rejected/user/:id', userAuth, getAllRejects);
Approval.get('/approved/user/:id', userAuth, getAllApproved);
Approval.delete('/approved/:id', userAuth, deleteApproved);
Approval.delete('/approval/:id', userAuth, deleteApproval);
Approval.put('/reject/:id', userAuth, reject);
Approval.get('/pending/:id', getApprovalById);
Approval.put('/:id', userAuth, approve);


module.exports = Approval;