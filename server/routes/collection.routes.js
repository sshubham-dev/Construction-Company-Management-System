const express = require("express");
const CollectionRoute = express.Router();
const {
  createCollection,
  getCollections,
  postCollection,
  cancelCollection,
  rejectCollection,
  updateCollection,
  deleteCollection,
  getCollection,
} = require("../controller/collection.controller");
const upload = require("../middlewares/Upload");
const { userAuth, adminAuth } = require("../middlewares/auth.middleware");
// create entry (employee)
CollectionRoute.post(
  "/",
  upload.single("proofImage"),
  userAuth,
  createCollection,
);

// list (accounts)
CollectionRoute.get("/", userAuth, getCollections);

// approve
CollectionRoute.put("/approve/:id", adminAuth, postCollection);

// reject
CollectionRoute.put("/reject/:id", adminAuth, rejectCollection);

// cancel
CollectionRoute.put("/cancel/:id", adminAuth, cancelCollection);

// update & delete
CollectionRoute.get("/:id", userAuth, getCollection);
CollectionRoute.put("/:id",  upload.single("proofImage"), userAuth, updateCollection);
CollectionRoute.delete("/:id", userAuth, deleteCollection);

module.exports = CollectionRoute;
