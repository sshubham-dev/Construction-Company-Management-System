const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    employeeName: String,
    employeeCode: String,
    department: String,
    month: String,

    baseSalary: Number,
    workingDays: Number,
    daysWorked: Number,

    leaveDeduction: Number,

    trafficScore: Number,
    trafficBonus: Number,
    targetBonus: Number,

    otherAdditions: Number,
    otherDeductions: Number,

    esicEmployee: Number,
    esicEmployer: Number,

    grossSalary: Number,
    totalAdditions: Number,
    totalDeductions: Number,

    netSalary: Number,
  },
  { timestamps: true },
);

const Payroll = mongoose.model("Payroll", salarySchema);

module.exports = Payroll;
