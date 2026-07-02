const express = require('express');
const PurchaseOrder = express.Router();
const {
    getPurchaseOrder,
    getPurchaseOrders,
    sitePurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getRequirements,
    updateRequirement,
    deleteRequirement,
    draftPurchaseOrders,
    // approvePurchaseOrder,
    getOpenPurchaseOrders
} = require('../controller/purchaseorder.controller.js');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

PurchaseOrder.get('/', getPurchaseOrders);
PurchaseOrder.post('/', userAuth, createPurchaseOrder);
PurchaseOrder.get('/draft', draftPurchaseOrders);
PurchaseOrder.get('/open', getOpenPurchaseOrders);
PurchaseOrder.get('/site/:id', sitePurchaseOrders,);
PurchaseOrder.get('/:id/requirement', getRequirements);
PurchaseOrder.put('/:id/requirement/:index', userAuth, updateRequirement);
// PurchaseOrder.put('/save/:id', userAuth, approvePurchaseOrder);
PurchaseOrder.delete('/:id/requirement/:index', userAuth, deleteRequirement);
PurchaseOrder.route('/:id')
    .get(getPurchaseOrder)
    .put(userAuth, updatePurchaseOrder)
    .delete(userAuth, deletePurchaseOrder);

module.exports = PurchaseOrder;
