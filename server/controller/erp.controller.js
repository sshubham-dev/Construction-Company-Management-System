
exports.getLedgerReport = async (req, res) => {
  try {
    const data = await service.getLedgerReport({
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

exports.getOutstanding = async (req, res) => {
  try {
    const { companyId, type } = req.query;

    const data = await service.getOutstanding(companyId, type);

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getBalanceSheet = async (req, res) => {
  try {
    const data = await service.getBalanceSheet(req.query.companyId);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getProfitAndLoss = async (req, res) => {
  try {
    const data = await service.getProfitAndLoss(
      req.query.companyId,
      req.query.from,
      req.query.to
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getTrialBalance = async (req, res) => {
  try {
    const data = await service.getTrialBalance(
      req.query.companyId,
      req.query.from,
      req.query.to
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};