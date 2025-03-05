const express = require('express');
const PurchaseRequest = express.Router();
const {getAllPurchaseRequests, getPurchaseRequestById, createPurchaseRequest, updatePurchaseRequest, deletePurchaseRequest, savePurchaserequest} = require('../controller/purchaserequest.controller'); // Adjust the path as necessary
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

PurchaseRequest.route('/').get(getAllPurchaseRequests).post(userAuth, createPurchaseRequest);
PurchaseRequest.route('/:id').get(getPurchaseRequestById).put(updatePurchaseRequest).delete(deletePurchaseRequest)
PurchaseRequest.put('/save/:id', userAuth, savePurchaserequest)

module.exports = PurchaseRequest;