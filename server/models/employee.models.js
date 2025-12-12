const mongoose = require("mongoose");
const { syncLedger } = require("../utils/ledgerSync");

const employeeSchema = new mongoose.Schema(
  {
    // ---------- your existing custom fields (keep identical) ----------
    name: { type: String },
    email: { type: String, unique: true, lowercase: true, trim: true },
    phone: { type: Number, required: true },
    whatsapp: { type: Number },
    employeeNo: { type: String, unique: true, index: true },
    gender: String,
    address: { type: String },
    addhar: { type: String },
    panNo: { type: String },
    cv: { type: String },
    offerletter: { type: String },
    bank: { type: String },
    isUser: { type: Boolean },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    certificates: [{ type: String }],
    joinDate: { type: Date, default: Date.now },
    department: { type: String },
    birthdate: { type: Date },
    pf: { type: String },
    esi: { type: String },
    uan: { type: String },
    taxRegime: String,
    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
    },

    // ledger reference (Salaries Payable)
    ledger: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
    compensationRules: {
      traffic: {
        greenBonus: Number, // +2000, +1500, +3000 depending on role
        redPenalty: Number, // -1000
      },
      site: {
        perTargetBonus: Number, // +1000 per achieved target
      },
      design: {
        fixedTargetBonus: Number, // 3000 on exact 30000
        percentageBonusRate: Number, // 0.10 on above 30000
      },
    },
    // references to new models
    salarySlip: [{ type: mongoose.Schema.Types.ObjectId, ref: "SalarySlip" }],
    expenseBills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expenses" }],

    // detailed transaction arrays (optional duplicates for quick UI) - keep minimal
    salaryHistory: [
      {
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
        amount: Number,
        date: Date,
        month: String,
        remarks: String,
      },
    ],

    advances: [
      {
        amount: Number,
        date: Date,
        reason: String,
      },
    ],

    bonus: [
      {
        amount: Number,
        date: Date,
        reason: String,
      },
    ],

    deductions: [
      {
        amount: Number,
        date: Date,
        reason: String,
      },
    ],

    // FINANCIAL SUMMARY (auto recalculated)
    financials: {
      // SALARY
      totalSalaryBilled: { type: Number, default: 0 },
      totalSalaryPaid: { type: Number, default: 0 },
      totalSalaryDue: { type: Number, default: 0 },

      // EXPENSES
      totalExpenseClaimed: { type: Number, default: 0 },
      totalExpensePaid: { type: Number, default: 0 },
      totalExpenseDue: { type: Number, default: 0 },

      // ADVANCES
      totalAdvanceTaken: { type: Number, default: 0 },
      totalAdvanceSettled: { type: Number, default: 0 },
      totalAdvanceBalance: { type: Number, default: 0 },

      // NET
      netPayableToEmployee: { type: Number, default: 0 }, // positive => company owes employee
    },

    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },

    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Resigned"],
    },
  },
  { timestamps: true }
);

/* -----------------------------
   Helper: recalcEmployeeFinance
   Sums salaryBills, expenseBills, cashAdvances to compute financial summary.
   This function queries related collections so it must be async.
   ----------------------------- */


// async function recalcEmployeeFinance(employeeDoc) {
//   // get models dynamically (avoid circular require)
//   const SalaryBill = mongoose.model("SalarySlip");
//   const ExpenseBill = mongoose.model("ExpenseBill");


//   // salary sums
//   const salaryBills = await SalaryBill.find({
//     _id: { $in: employeeDoc.salaryBills || [] },
//   }).lean();
//   const totalSalaryBilled = salaryBills.reduce(
//     (s, b) => s + (b.netPay || 0),
//     0
//   );
//   const totalSalaryPaid = salaryBills.reduce(
//     (s, b) => s + (b.totalPaid || 0),
//     0
//   );
//   const totalSalaryDue = Math.max(0, totalSalaryBilled - totalSalaryPaid);

//   // expense sums
//   const expenseBills = await ExpenseBill.find({
//     _id: { $in: employeeDoc.expenseBills || [] },
//   }).lean();
//   const totalExpenseClaimed = expenseBills.reduce(
//     (s, b) => s + (b.totalAmount || 0),
//     0
//   );
//   const totalExpensePaid = expenseBills.reduce(
//     (s, b) => s + (b.totalPaid || 0),
//     0
//   );
//   const totalExpenseDue = Math.max(0, totalExpenseClaimed - totalExpensePaid);

//   // advances sums
//   const advances = await CashAdvance.find({
//     _id: { $in: employeeDoc.cashAdvances || [] },
//   }).lean();
//   const totalAdvanceTaken = advances.reduce((s, a) => s + (a.amount || 0), 0);
//   const totalAdvanceSettled = advances.reduce(
//     (s, a) => s + (a.totalSettled || 0),
//     0
//   );
//   const totalAdvanceBalance = Math.max(
//     0,
//     totalAdvanceTaken - totalAdvanceSettled
//   );

//   // final net payable:
//   // company owes = salaryDue + expenseDue - advanceBalance
//   const netPayableToEmployee = Math.max(
//     0,
//     totalSalaryDue + totalExpenseDue - totalAdvanceBalance
//   );

//   // set into doc
//   employeeDoc.financials.totalSalaryBilled = totalSalaryBilled;
//   employeeDoc.financials.totalSalaryPaid = totalSalaryPaid;
//   employeeDoc.financials.totalSalaryDue = totalSalaryDue;

//   employeeDoc.financials.totalExpenseClaimed = totalExpenseClaimed;
//   employeeDoc.financials.totalExpensePaid = totalExpensePaid;
//   employeeDoc.financials.totalExpenseDue = totalExpenseDue;

//   employeeDoc.financials.totalAdvanceTaken = totalAdvanceTaken;
//   employeeDoc.financials.totalAdvanceSettled = totalAdvanceSettled;
//   employeeDoc.financials.totalAdvanceBalance = totalAdvanceBalance;

//   employeeDoc.financials.netPayableToEmployee = netPayableToEmployee;

//   // convenience totals
//   employeeDoc.totalPaid =
//     totalSalaryPaid + totalExpensePaid + totalAdvanceSettled;
//   employeeDoc.totalDue = netPayableToEmployee;
// }

/* -----------------------------
   Ledger sync middleware
   Employees are placed under "Salaries Payable"
   ----------------------------- */
employeeSchema.pre("save", async function (next) {
  try {
    // recalc finances
    // await recalcEmployeeFinance(this);

    // sync ledger
    const ledgerId = await syncLedger({
      doc: this,
      type: "Employee",
      under: "Salaries Payable",
      getAddress: (doc) => ({ name: doc.name, address: doc.address || "" }),
      getTaxDetails: (doc) => ({ panNo: doc.panNo || "" }),
    });

    if (ledgerId) this.ledger = ledgerId;

    next();
  } catch (err) {
    console.error("Error in employee pre-save:", err);
    next(err);
  }
});

employeeSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const employee = await this.model.findOne(this.getQuery());
    if (!employee) return next();

    // apply update locally for accurate recalc
    const update = this.getUpdate() || {};
    if (update.$set) Object.assign(employee, update.$set);
    Object.assign(employee, update);

    // await recalcEmployeeFinance(employee);

    // sync ledger
    const ledgerId = await syncLedger({
      doc: employee,
      type: "Employee",
      under: "Salaries Payable",
      getAddress: (doc) => ({ name: doc.name, address: doc.address || "" }),
      getTaxDetails: (doc) => ({ panNo: doc.panNo || "" }),
    });

    if (!update.$set) update.$set = {};
    update.$set.ledger = ledgerId;

    // push recalculated financial fields into update
    update.$set["financials.totalSalaryBilled"] =
      employee.financials.totalSalaryBilled;
    update.$set["financials.totalSalaryPaid"] =
      employee.financials.totalSalaryPaid;
    update.$set["financials.totalSalaryDue"] =
      employee.financials.totalSalaryDue;

    update.$set["financials.totalExpenseClaimed"] =
      employee.financials.totalExpenseClaimed;
    update.$set["financials.totalExpensePaid"] =
      employee.financials.totalExpensePaid;
    update.$set["financials.totalExpenseDue"] =
      employee.financials.totalExpenseDue;

    update.$set["financials.totalAdvanceTaken"] =
      employee.financials.totalAdvanceTaken;
    update.$set["financials.totalAdvanceSettled"] =
      employee.financials.totalAdvanceSettled;
    update.$set["financials.totalAdvanceBalance"] =
      employee.financials.totalAdvanceBalance;

    update.$set["financials.netPayableToEmployee"] =
      employee.financials.netPayableToEmployee;

    update.$set.totalPaid = employee.totalPaid;
    update.$set.totalDue = employee.totalDue;

    this.setUpdate(update);

    next();
  } catch (err) {
    console.error("Error in employee pre-findOneAndUpdate:", err);
    next(err);
  }
});

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
