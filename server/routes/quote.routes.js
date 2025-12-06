const express = require("express");
const { userAuth } = require("../middlewares/auth.middleware.js");
const { createQuotation, getAllQuotations, getQuotationById, updateQuotation, deleteQuotation, getRates, createOrUpdateRate, calculateQuote, getPackages } = require("../controller/quote.controller.js");

const Rates = express.Router();
const Quotation = express.Router();
const Packages = express.Router();

Rates.get("/",  userAuth, getRates);
Packages.get("/",  userAuth, getPackages);
Quotation.get("/", getAllQuotations);
Rates.post("/",  userAuth, createOrUpdateRate);
Quotation.post("/calculate", calculateQuote);
Quotation.post("/", userAuth, createQuotation);

Quotation.get("/:id", getQuotationById);
Quotation.put("/:id", updateQuotation);
Quotation.delete("/:id", deleteQuotation);


module.exports = {Rates, Quotation, Packages}
