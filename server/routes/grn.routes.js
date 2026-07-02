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
GRN.patch("/post/:id", postGRN);
GRN.get("/:id", getGRN);
GRN.put("/:id", updateGRN);
GRN.delete("/:id", cancelGRN);

module.exports = GRN;