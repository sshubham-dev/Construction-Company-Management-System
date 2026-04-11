const { getOutstanding, getLedgerReport, getBalanceSheet, getCombinedReport, getProfitAndLoss, getSummary, getTrialBalance, getBusinessUnitReport, getCostCenterReport } = require("../services/ERP/report.service");

const Outstanding = async (req, res) => {
  try {
    const { companyId, type } = req.query;

    const data = await getOutstanding(companyId, type);

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const LedgerReport = async (req, res) => {
  try {
    const data = await getLedgerReport({
      ledgerId: req.params.id,
      companyId: req.query.companyId,
      fromDate: req.query.from,
      toDate: req.query.to,
    });

    res.json(data);
  } catch (e) {
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
    
  } catch (error) {
    console.log(error)
    res.status(404).json(error)
  }
}
const ProfitAndLoss = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error)
    res.status(404).json(error)
  }
}
const Summary = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error)
    res.status(404).json(error)
  }
}
const TrialBalance = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error)
    res.status(404).json(error)
  }
}
const CostCenterReport = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error)
    res.status(404).json(error)
  }
}
const BusinessUnitReport = async (req, res) => {
  try {
    
  } catch (error) {
    console.log(error)
    res.status(404).json(error)
  }
}


module.exports ={
  Outstanding,
  LedgerReport,
  MultiReport,
  BusinessUnitReport,
  BalanceSheet,
  ProfitAndLoss,
  Summary,
  TrialBalance,
  CostCenterReport,
}