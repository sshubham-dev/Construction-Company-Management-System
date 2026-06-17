const {
  getOutstanding,
  getLedgerReport,
  getBalanceSheet,
  getProfitAndLoss,
  getSummary,
  getTrialBalance,
  getBusinessUnitReport,
  getCostCenterReport,
  getCashFlowReport,
  getSiteAnalysis,
  getCashFlowDetails,
  getDashboard,
} = require("../services/ERP/report.service");


const Dashboard = async (req, res) => {
  try {
    const {
      companyId,
      fromDate,
      toDate,
    } = req.query;
    console.log("Finding Data")
    const data = await getDashboard(
      companyId,
      fromDate,
      toDate,
    );
    // console.log(data)
    console.log("found data")
    res.json(data);
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: error,
    });
  }
};


const Outstanding = async (req, res) => {
  try {
    const { companyId, partyType, fromDate, toDate } = req.query;
    console.log("Outstanding report finding ");
    const data = await getOutstanding(companyId, partyType, fromDate, toDate);

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
    const {
      companyId,
      fromDate,
      toDate,
    } = req.query;

    const data = await getCostCenterReport(
      companyId,
      fromDate,
      toDate
    );

    res.json(data);
    console.log(data)
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

const CashFlowReport = async (req, res) => {
  try {
    console.log("Cash Flow report finding ");
    const { companyId, fromDate, toDate } = req.query;
    const data = await getCashFlowReport(
      companyId,
      fromDate,
      toDate);
    res.json(data);
    console.log("Cash Flow report found ");
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};

const CashFlowDetails = async (req, res) => {
  try {

    const {
      companyId,
      category,
      fromDate,
      toDate,
    } = req.query;

    const data =
      await getCashFlowDetails(
        companyId,
        category,
        fromDate,
        toDate
      );

    res.json(data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

const SiteAnalysis = async (req, res) => { };

module.exports = {
  Dashboard,
  Outstanding,
  LedgerReport,
  BusinessUnitReport,
  BalanceSheet,
  ProfitAndLoss,
  Summary,
  TrialBalance,
  CostCenterReport,
  CashFlowReport,
  CashFlowDetails
};
