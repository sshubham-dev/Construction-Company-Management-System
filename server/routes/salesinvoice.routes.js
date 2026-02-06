const express = require("express");
const SalesInvoice = express.Router();
const {createSalesInvoice, postSalesInvoice, getSalesInvoices, getSalesInvoiceById, createSalesInvoiceFromDN, getReturnableSalesInvoices} = require("../controller/salesinvoice.controller.js");

// CREATE Sales Invoice
SalesInvoice.post("/", createSalesInvoice);

// GET Returnable Sales Invoices
SalesInvoice.get("/site/:siteId/returnable", getReturnableSalesInvoices);
// GET All Sales Invoices
SalesInvoice.get("/", getSalesInvoices);
// GET Sales Invoice by ID
SalesInvoice.get("/:id", getSalesInvoiceById);
// CREATE Sales Invoice from Delivery Note
SalesInvoice.post("/from-dn", createSalesInvoiceFromDN);

module.exports = SalesInvoice;