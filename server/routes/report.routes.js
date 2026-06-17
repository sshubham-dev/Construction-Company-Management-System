const express = require("express");
const Reports = express.Router();
const {
  Dashboard,
  Outstanding,
  LedgerReport,
  CashFlowReport,
  BusinessUnitReport,
  BalanceSheet,
  ProfitAndLoss,
  Summary,
  TrialBalance,
  CostCenterReport,
  CashFlowDetails,
} = require("../controller/voucher.controller");
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");

Reports.get("/dashboard", userAuth, Dashboard);
Reports.get("/ledger", userAuth, LedgerReport);
Reports.get("/outstanding", userAuth, Outstanding);
Reports.get("/business-unit", userAuth, BusinessUnitReport);
Reports.get("/balance-sheet", userAuth, BalanceSheet);
Reports.get("/pnl", userAuth, ProfitAndLoss);
Reports.get("/summary", userAuth, Summary);
Reports.get("/trial-balance", userAuth, TrialBalance);
Reports.get("/cost-center", userAuth, CostCenterReport);
Reports.get("/cash-flow", userAuth, CashFlowReport);
Reports.get("/cash-flow-details", userAuth, CashFlowDetails);
Reports.get("/site-profit", userAuth);

module.exports = Reports;
