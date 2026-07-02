const express = require("express");
const SalesInvoice = express.Router();
const {createSalesInvoice, postSalesInvoice, getSalesInvoices, getSalesInvoiceById, createSalesInvoiceFromDN, getReturnableSalesInvoices} = require("../controller/salesinvoice.controller.js");

// CREATE Sales Invoice
SalesInvoice.post("/", createSalesInvoice);

// GET All Sales Invoices
SalesInvoice.get("/", getSalesInvoices);
// CREATE Sales Invoice from Delivery Note
SalesInvoice.post("/from-dn", createSalesInvoiceFromDN);
// GET Returnable Sales Invoices
SalesInvoice.get("/site/:siteId/returnable", getReturnableSalesInvoices);
// GET Sales Invoice by ID
SalesInvoice.get("/:id", getSalesInvoiceById);

module.exports = SalesInvoice;