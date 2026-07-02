const express = require("express");
const PurchaseRequest = express.Router();
const {
  createPurchaseRequest,
  updatePurchaseRequest,
  submitPurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  deletePurchaseRequest,
  getAllPurchaseRequests,
  getPurchaseRequestById,
  getPurchaseRequestBySite,
  getOpenPRForDN,
  getOpenPRForRFQ,
} = require("../controller/purchaserequest.controller"); // Adjust the path as necessary
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

PurchaseRequest.route("/")
  .get(getAllPurchaseRequests)
  .post(userAuth, createPurchaseRequest);
PurchaseRequest.get("/open-pr", userAuth, getOpenPRForDN); // Endpoint to get open PRs for store
PurchaseRequest.get("/open-rfq", userAuth, getOpenPRForRFQ); // Endpoint to get open PRs for store
PurchaseRequest.put("/submit/:id", userAuth, submitPurchaseRequest);
PurchaseRequest.put("/save/:id", userAuth, approvePurchaseRequest);
PurchaseRequest.route("/:id")
  .get(getPurchaseRequestById)
  .put(updatePurchaseRequest)
  .delete(deletePurchaseRequest);
// PurchaseRequest.put(
//   "/:id/requirement/:index",
//   userAuth,
//   updatePurchaseRequirement,
// );
PurchaseRequest.get("/site/:id", getPurchaseRequestBySite);

module.exports = PurchaseRequest;
