const mongoose = require("mongoose");


const salaryPaymentSubSchema =  new mongoose.Schema({
  paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  amount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  remarks: String
}, { _id: false });

const salaryslipSchema =  new mongoose.Schema({
  employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  payPeriodStart: Date,
  payPeriodEnd: Date,
  billDate: { type: Date, default: Date.now },

  // Salary breakup (keeps it simple)
  grossSalary: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 }, // statutory + others
  netPay: { type: Number, default: 0 }, // computed gross + allowances - deductions

  // Payment tracking
  payments: [salaryPaymentSubSchema],
  totalPaid: { type: Number, default: 0 }, // sum(payments.amount)
  balance: { type: Number, default: 0 },   // netPay - totalPaid

  // Status
  status: {
    type: String,
    enum: ["Pending", "Partially Paid", "Paid"],
    default: "Pending"
  },

  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  remarks: String
}, { timestamps: true });

salaryslipSchema.pre("save", function () {
  // compute netPay and totals
  this.netPay = (this.grossSalary || 0) + (this.allowances || 0) - (this.deductions || 0);
  this.totalPaid = (this.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
  this.balance = Math.max(0, (this.netPay || 0) - this.totalPaid);
  if (this.totalPaid <= 0) this.status = "Pending";
  else if (this.balance > 0) this.status = "Partially Paid";
  else this.status = "Paid";
});

const SalarySlip = mongoose.model('SalarySlip', salaryslipSchema)
module.exports = SalarySlip