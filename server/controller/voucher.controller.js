const {
  getOutstanding,
  getLedgerReport,
  getBalanceSheet,
  getCombinedReport,
  getProfitAndLoss,
  getSummary,
  getTrialBalance,
  getBusinessUnitReport,
  getCostCenterReport,
} = require("../services/ERP/report.service");

const Outstanding = async (req, res) => {
  try {
    const { companyId, type } = req.query;
    console.log("Outstanding report finding ");
    const data = await getOutstanding(companyId, type);

    res.json(data);
    console.log("Outstanding report found ");
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
};

const LedgerReport = async (req, res) => {
  try {
    console.log("ledger report finding ");
    const data = await getLedgerReport({
      ledgerId: req.query.ledgerId,
      companyId: req.query.companyId,
      fromDate: req.query.from,
      toDate: req.query.to,
    });

    res.json(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
};

const MultiReport = async (req, res) => {
  const { companyId } = req.query;

  const data = await getCombinedReport(companyId);

  res.json(data);
};

const BalanceSheet = async (req, res) => {
  try {
    const { companyId, fromDate, toDate } = req.query;
    console.log("Balance sheet report finding ");
    const data = await getBalanceSheet(companyId, fromDate, toDate);
    res.json(data);
    console.log("Balance sheet report found ");
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

const ProfitAndLoss = async (req, res) => {
  try {
    const { companyId, fromDate, toDate } = req.query;
    console.log("P&L report finding ");
    const data = await getProfitAndLoss(companyId, fromDate, toDate);
    res.json(data);
    console.log("P&L report found ");
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

const Summary = async (req, res) => {
  try {
    const { companyId, fromDate, toDate } = req.query;
    console.log("Summary report finding ");
    const data = await getSummary(companyId, fromDate, toDate);
    res.json(data);
    console.log("Summary report found ");
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

const TrialBalance = async (req, res) => {
  try {
    console.log("Trial balance report finding ");
    const { companyId, fromDate, toDate } = req.query;
    const data = await getTrialBalance(companyId, fromDate, toDate);
    res.json(data);
    console.log("Trial balance report found ");
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

const CostCenterReport = async (req, res) => {
  try {
    console.log("Cost center report finding ");
    const { companyId } = req.query;
    const data = await getCostCenterReport(companyId);
    res.json(data);
    console.log("Cost center report found ");
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

const BusinessUnitReport = async (req, res) => {
  try {
    console.log("Business unit report finding ");
    const { companyId } = req.query;
    const data = await getBusinessUnitReport(companyId);
    res.json(data);
    console.log("Business unit report found ");
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

module.exports = {
  Outstanding,
  LedgerReport,
  MultiReport,
  BusinessUnitReport,
  BalanceSheet,
  ProfitAndLoss,
  Summary,
  TrialBalance,
  CostCenterReport,
};
