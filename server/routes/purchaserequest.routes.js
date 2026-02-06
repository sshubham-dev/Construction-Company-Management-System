const express = require('express');
const PurchaseRequest = express.Router();
const {getAllPurchaseRequests, getPurchaseRequestById, createPurchaseRequest, updatePurchaseRequest, deletePurchaseRequest, savePurchaserequest, getPurchaseRequestBySite, updatePurchaseRequirement, getOpenPRForDN} = require('../controller/purchaserequest.controller'); // Adjust the path as necessary
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

PurchaseRequest.route('/').get(getAllPurchaseRequests).post(userAuth, createPurchaseRequest);
PurchaseRequest.get('/open-for-store', userAuth, getOpenPRForDN); // Endpoint to get open PRs for store
PurchaseRequest.route('/:id').get(getPurchaseRequestById).put(updatePurchaseRequest).delete(deletePurchaseRequest)
PurchaseRequest.put('/save/:id', userAuth, savePurchaserequest)
PurchaseRequest.put('/:id/requirement/:index', userAuth, updatePurchaseRequirement)
PurchaseRequest.get('/site/:id', getPurchaseRequestBySite)

module.exports = PurchaseRequest;