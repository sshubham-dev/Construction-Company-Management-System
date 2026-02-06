const express = require("express");
const GRN = express.Router();
const {
  createGRN,
  postGRN,
  cancelGRN,
  listGRN,
  getGRN,
  updateGRN,
} = require("../controller/grn.controller");

GRN.post("/", createGRN);
GRN.get("/", listGRN);
GRN.get("/:id", getGRN);
GRN.put("/:id", updateGRN);
GRN.patch("/post/:id", postGRN);
GRN.delete("/:id", cancelGRN);

module.exports = GRN;