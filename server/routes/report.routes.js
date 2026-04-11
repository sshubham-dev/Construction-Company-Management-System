const Reports = require("express").Router();
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

Reports.route("/outstanding", userAuth, Outstanding);
Reports.route("/ledger", userAuth, LedgerReport);
Reports.route("/multi", userAuth, MultiReport);
Reports.route("/bu", userAuth, BusinessUnitReport);
Reports.route("/balance-sheet", userAuth, BalanceSheet);
Reports.route("/pnl", userAuth, ProfitAndLoss);
Reports.route("/summary", userAuth, Summary);
Reports.route("/trial-balance", userAuth, TrialBalance);
Reports.route("/cost-center", userAuth, CostCenterReport);
Reports.route("/cash-flow", userAuth, CostCenterReport);
Reports.route("/site-profit", userAuth);

module.exports = Reports;
