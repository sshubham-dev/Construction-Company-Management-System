const Payroll = require("../models/payroll.models");

const calculateSalary = (data) => {
  const {
    baseSalary,
    workingDays,
    daysWorked,
    trafficBonus = 0,
    targetBonus = 0,
    otherAdditions = 0,
    otherDeductions = 0,
  } = data;

  const perDay = baseSalary / workingDays;

  const leaveDeduction = baseSalary - perDay * daysWorked;

  const salaryAfterLeave = baseSalary - leaveDeduction;

  const esicEmployee = salaryAfterLeave * 0.0075;

  const esicEmployer = salaryAfterLeave * 0.0325;

  const totalAdditions = trafficBonus + targetBonus + otherAdditions;

  const totalDeductions = leaveDeduction + otherDeductions;

  const netSalary = baseSalary + totalAdditions - totalDeductions;

  return {
    leaveDeduction,
    esicEmployee,
    esicEmployer,
    totalAdditions,
    totalDeductions,
    netSalary,
  };
};

const calculate = async (req, res) => {
  try {
    const result = calculateSalary(req.body);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPayroll = async (req, res) => {
  try {
    const calculation = calculateSalary(req.body);

    const salary = new Payroll({
      ...req.body,
    //   ...calculation,
    });

    await salary.save();

    res.json(salary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPayrolls = async (req, res) => {
  const salaries = await Payroll.find().sort({ createdAt: -1 });

  res.json(salaries);
};

const getPayroll = async (req, res) => {
  const salary = await Payroll.findById(req.params.id);

  res.json(salary);
};

const updatePayroll = async (req, res) => {};
const deletePayroll = async (req, res) => {
  const {id} = req.params;
  const deleted = await Payroll.findByIdAndDelete(id);
  res.json("Payroll deleted.")
};

module.exports = {
  createPayroll,
  getPayrolls,
  getPayroll,
  updatePayroll,
  deletePayroll,
  calculate,
};
