const express = require("express");
const DN = express.Router();
const {
  createDeliveryNote,
  confirmDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,
} = require("../controller/deliverynote.controller"); // Adjust the path as necessary
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

DN.route("/").get(getDeliveryNotes).post(userAuth, createDeliveryNote);
DN.route("/:id").get(getDeliveryNoteById).put(userAuth, confirmDeliveryNote); // Confirm DN
module.exports = DN;
