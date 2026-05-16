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
} = require("../controller/rfq.controller"); // Adjust the path as necessary
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

RFQs.route("/").get(getRFQs).post(userAuth, createRFQ);
RFQs.get('/:id', getRFQById)
RFQs.put("/send/:id", userAuth, sendRFQ);
RFQs.put("/close/:id", userAuth, closeRFQ);
RFQs.post('/submit', submitQuotation);
RFQs.post('/select-quotation/:quoteId', selectQuotation)
RFQs.get('/quote/:id', getQuotationById)
RFQs.get('/comparison/:id', compareQuotations)

// DN.put("/:id/verify", userAuth, verifyDeliveryNote);

module.exports = RFQs;