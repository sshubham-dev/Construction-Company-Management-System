const express = require("express");
const CollectionRoute = express.Router();
const {createCollection,
  getCollections,
  approveCollection,
  rejectCollection,} = require("../controller/collection.controller");
const upload = require('../middlewares/Upload');
const { userAuth } = require('../middlewares/auth.middleware');
// create entry (employee)
CollectionRoute.post(
  "/",
  upload.single("proofImage"),
  userAuth,
  createCollection
);

// list (accounts)
CollectionRoute.get("/", getCollections);

// approve
CollectionRoute.post(
  "/:id/approve",
  userAuth,
  approveCollection
);

// reject
CollectionRoute.post(
  "/:id/reject",
  rejectCollection
);

module.exports = CollectionRoute;
