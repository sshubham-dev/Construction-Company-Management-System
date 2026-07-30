const express = require('express');
const Purchase = express.Router();
// const {
//     createPurchase, getAllPurchases, getPurchaseById, updatePurchase, deletePurchase
// } = require('../controller/purchase.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

const purchaseController = require("../controller/purchaseinvoice.controller");

Purchase.post("/", userAuth, purchaseController.createPurchaseInvoice);

Purchase.get("/", userAuth, purchaseController.getPurchasesInvoice);

Purchase.get("/:id", userAuth, purchaseController.getPurchaseByIdInvoice);

Purchase.put("/:id", userAuth, purchaseController.updatePurchaseInvoice);

Purchase.delete("/:id", userAuth, purchaseController.deletePurchaseInvoice);

Purchase.post("/:id/post", userAuth, purchaseController.postPurchaseInvoice);

Purchase.post("/:id/cancel", userAuth, purchaseController.cancelPurchaseInvoice);

module.exports = Purchase;
