const express = require('express');
const PurchaseInv = express.Router();
// const {
//     createPurchase, getAllPurchases, getPurchaseById, updatePurchase, deletePurchase
// } = require('../controller/purchase.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

const purchaseController = require("../controller/purchase.controller");

PurchaseInv.post("/", userAuth, purchaseController.createPurchase);

PurchaseInv.get("/", userAuth, purchaseController.getPurchases);

PurchaseInv.get("/:id", userAuth, purchaseController.getPurchaseById);

PurchaseInv.put("/:id", userAuth, purchaseController.updatePurchase);

PurchaseInv.delete("/:id", userAuth, purchaseController.deletePurchase);

PurchaseInv.post("/:id/post", userAuth, purchaseController.postPurchase);

PurchaseInv.post("/:id/cancel", userAuth, purchaseController.cancelPurchase);

module.exports = PurchaseInv;
