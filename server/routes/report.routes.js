const express = require("express");
const Reports = express.Router();
const {
  Outstanding,
  LedgerReport,
  MultiReport,
  BusinessUnitReport,
  BalanceSheet,
  ProfitAndLoss,
  Summary,
  TrialBalance,
  CostCenterReport,
} = require("../controller/voucher.controller");
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

Reports.get("/ledger", userAuth, LedgerReport);
Reports.get("/outstanding", userAuth, Outstanding);
Reports.get("/multi", userAuth, MultiReport);
Reports.get("/bu", userAuth, BusinessUnitReport);
Reports.get("/balance-sheet", userAuth, BalanceSheet);
Reports.get("/pnl", userAuth, ProfitAndLoss);
Reports.get("/summary", userAuth, Summary);
Reports.get("/trial-balance", userAuth, TrialBalance);
Reports.get("/cost-center", userAuth, CostCenterReport);
Reports.get("/cash-flow", userAuth, CostCenterReport);
Reports.get("/site-profit", userAuth);

module.exports = Reports;
