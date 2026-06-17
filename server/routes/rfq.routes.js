const express = require("express");
const RFQs = express.Router();
const {
    createRFQ,
    getRFQs,
    getRFQById,
    sendRFQ,
    closeRFQ,
    submitQuotation,
    selectQuotation,
    getQuotationById,
    compareQuotations,
    getVendorRFQ,
} = require("../controller/rfq.controller"); // Adjust the path as necessary
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

RFQs.route("/").get(getRFQs).post(userAuth, createRFQ);
RFQs.get('/:id', userAuth, getRFQById);
RFQs.put("/send/:id", userAuth, sendRFQ);
RFQs.put("/close/:id", userAuth, closeRFQ);
RFQs.post('/public/submit', submitQuotation);
RFQs.post('/select-quotation/:quoteId', userAuth, selectQuotation);
RFQs.get('/quote/:id', userAuth, getQuotationById);
RFQs.get('/comparison/:id', userAuth, compareQuotations);
RFQs.get("/vendor/rfq/:token", getVendorRFQ);

// DN.put("/:id/verify", userAuth, verifyDeliveryNote);

module.exports = RFQs;