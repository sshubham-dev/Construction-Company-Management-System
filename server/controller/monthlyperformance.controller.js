const {
  generateMonthlyPerformance,
} = require("../middlewares/monthlyPerformance.middleware");

const generate = async (req, res) => {
  try {
    const { employeeId, month, trafficLightRuleId } = req.body;

    const result = await generateMonthlyPerformance(
      employeeId,
      month,
      trafficLightRuleId
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { generate };
