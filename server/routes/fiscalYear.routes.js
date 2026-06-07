const express = require("express");

const controller = require("../controller/fiscalYear.controller.js");
const validateFiscalYear = require("../middlewares/validateFiscalYear.js");

const FiscalYear = express.Router();

FiscalYear.post(
    "/",
    validateFiscalYear,
    controller.create
);

FiscalYear.get(
    "/",
    controller.get
);

FiscalYear.patch(
    "/:id/close",
    controller.close
);

FiscalYear.patch(
    "/:id/reopen",
    controller.reopen
);

FiscalYear.delete(
    "/:id",
    controller.remove
);


module.exports = FiscalYear;