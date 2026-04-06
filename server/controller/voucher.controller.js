const { getOutstanding } = require("../services/ERP/outstanding.service");
const { getLedgerReport } = require("../services/ERP/ledgerReport.service");

const getOutstanding = async (req, res) => {
  try {
    const { companyId, type } = req.query;

    const data = await getOutstanding(companyId, type);

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getLedgerReport = async (req, res) => {
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