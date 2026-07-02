const express = require("express");
const DN = express.Router();
const {
  createDeliveryNote,
  updateDeliveryNote,
  issueDeliveryNote,
  receiveDeliveryNote,
  verifyDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,
} = require("../controller/deliverynote.controller"); // Adjust the path as necessary
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

DN.route("/").get(getDeliveryNotes).post(userAuth, createDeliveryNote);

DN.put("/issue/:id", userAuth, issueDeliveryNote);

DN.put("/receive/:id", userAuth, receiveDeliveryNote);

DN.route("/:id").get(getDeliveryNoteById).put(userAuth, updateDeliveryNote);
// DN.put("/:id/verify", userAuth, verifyDeliveryNote);

module.exports = DN;
