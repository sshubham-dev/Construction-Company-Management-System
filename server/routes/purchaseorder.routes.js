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
    getSiteAndContractorPurchaseOrders,
    draftPurchaseOrders,
    savePurchaseOrder
} = require('../controller/purchaseorder.controller.js');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

PurchaseOrder.get('/', getPurchaseOrders);
PurchaseOrder.get('/draft/:id', draftPurchaseOrders);
PurchaseOrder.get('/:id/requirement', getRequirements);
PurchaseOrder.get('/site/:id', sitePurchaseOrders,);
PurchaseOrder.get('/:siteId/:supplierId', getSiteAndContractorPurchaseOrders);
PurchaseOrder.put('/:id/requirement/:index', userAuth, updateRequirement);
PurchaseOrder.put('/save/:id', userAuth, savePurchaseOrder);
PurchaseOrder.delete('/:id/requirement/:index', userAuth, deleteRequirement);
PurchaseOrder.post('/', userAuth, createPurchaseOrder);
PurchaseOrder.route('/:id')
    .get(getPurchaseOrder)
    .put(userAuth, updatePurchaseOrder)
    .delete(userAuth, deletePurchaseOrder);

module.exports = PurchaseOrder;
