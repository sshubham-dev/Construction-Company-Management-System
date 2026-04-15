const mongoose = require("mongoose");
const { syncLedger } = require("../utils/ledgerSync");

const employeeSchema = new mongoose.Schema(
  {
    /* ================= BASIC IDENTITY ================= */
    name: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    phone: { type: Number, required: true },
    whatsapp: { type: Number },
    employeeID: { type: String, unique: true, index: true },

    gender: String,
    birthdate: Date,
    address: String,

    /* ================= EMPLOYMENT ================= */
    department: String,
    reportingManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    joinDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Resigned"],
      default: "Active",
    },

    /* ================= PAYROLL ================= */
    baseSalary: Number,
    ledger: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
    isUser: Boolean,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    /* ================= COMPLIANCE ================= */
    addhar: String,
    panNo: String,
    pf: String,
    esi: String,
    uan: String,
    taxRegime: String,

    /* ================= DOCUMENTS ================= */
    cv: {
      secure_url: String,
      public_id: String,
    },
    offerletter: {
      secure_url: String,
      public_id: String,
    },
    certificates: [{ type: String }],
    bank: String,

    /* ================= TRAFFIC LIGHT & INCENTIVE RULES ================= */
    incentiveConfig: {
      trafficLight: {
        greenBonus: { type: Number, default: 2000 },
        redPenalty: { type: Number, default: 1000 },
      },

      targets: [
        {
          targetType: {
            type: String,
          },
          baseTargetValue: Number, // e.g. 30000
          bonusType: {
            type: String,
            enum: ["FIXED", "PERCENTAGE"],
          },
          bonusValue: Number, // 3000 OR 10 (means 10%)
        },
      ],
    },
    monthlyPerformance: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TrafficLight",
      },
    ],

    /* ================= REFERENCES ================= */
    salarySlip: [{ type: mongoose.Schema.Types.ObjectId, ref: "SalarySlip" }],
    expenseBills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expenses" }],

    /* ================= FINANCIAL CACHE (OPTIONAL) ================= */
    financials: {
      totalSalaryPaid: { type: Number, default: 0 },
      totalSalaryDue: { type: Number, default: 0 },
      totalExpensePaid: { type: Number, default: 0 },
      totalAdvanceBalance: { type: Number, default: 0 },
      netPayableToEmployee: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
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
employeeSchema.pre("save", async function () {
  try {
    // recalc finances
    // await recalcEmployeeFinance(this);

    // sync ledger
    const ledgerId = await syncLedger({
      doc: this,
      category: "Employee",
      getAddress: (doc) => ({
        name: doc.name,
        phoneNo: doc.phone,
        email: doc.email,
        address: doc.address || "",
      }),
      getTaxDetails: (doc) => ({ panNo: doc.panNo || "" }),
    });

    if (this.ledger?.toString() !== ledgerId.toString()) {
      this.ledger = ledgerId;
    }
  } catch (err) {
    console.log("Error in employee pre-save:", err);
    return err;
  }
});

employeeSchema.pre("findOneAndUpdate", async function () {
  try {
    const employee = await this.model.findOne(this.getQuery());
    if (!employee) return;

    const update = this.getUpdate() || {};

    // Apply updates locally
    if (update.$set) Object.assign(employee, update.$set);

    // ✅ sync ledger with REAL document
    const ledgerId = await syncLedger({
      doc: employee,
      category: "Employee",
      getAddress: (doc) => ({
        name: doc.name,
        phoneNo: doc.phone,
        email: doc.email,
        address: doc.address || "",
      }),
      getTaxDetails: (doc) => ({ panNo: doc.panNo || "" }),
    });

    if (!update.$set) update.$set = {};
    if (ledgerId) update.$set.ledger = ledgerId;

    // ✅ Financials sync (safe access)
    if (employee.financials) {
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
    }

    update.$set.totalPaid = employee.totalPaid;
    update.$set.totalDue = employee.totalDue;

    this.setUpdate(update);
  } catch (err) {
    console.error("Error in employee pre-findOneAndUpdate:", err);
  }
});

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
