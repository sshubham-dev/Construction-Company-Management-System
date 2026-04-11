const { Ledger } = require("../models/ledger.models"); // ✅ Fix import
const Expenses = require("../models/expenses.models"); // ✅ your expense schema
const { uploadOnCloudinary } = require("../utils/cloudinary"); // ✅ adjust as needed
const Employee = require("../models/employee.models");
const {
  sendApproveByAdmin,
  sendApproveByAccountHead,
} = require("./approval.controller.js");
const User = require("../models/user.models");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");
const {
  createVoucher,
  postVoucher,
  cancelVoucher,
  updateVoucher,
} = require("../services/ERP/voucher/voucher.service.js");


const resolvePaidByLedger = async (userId) => {
  const employee = await Employee.findOne({ userId });
  if (!employee) throw new Error("Employee not found");

  const ledger = await Ledger.findById(employee.ledger);
  if (!ledger) throw new Error("Employee ledger not found");

  return ledger;
};

/* ======================================================
   CREATE EXPENSE (DRAFT)
====================================================== */
const createExpense = async (req, res) => {
  try {
    const {
      date,
      amount,
      narration,
      expenseLedgerId,
      expenseForLedgerId,
      expenseCategory,
    } = req.body;
    const user = req.user;

    if (!expenseLedgerId || !expenseForLedgerId) {
      return res.status(400).json({ message: "Required ledger missing" });
    }

    const paidByLedger = await resolvePaidByLedger(req.user._id);

    const expenseLedger = await Ledger.findById(expenseLedgerId);
    const expenseForLedger = await Ledger.findById(expenseForLedgerId);

    if (!expenseLedger || !expenseForLedger) {
      return res.status(400).json({ message: "Invalid ledger selected" });
    }

    let attachments = [];

    const files = req.files || (req.file ? [req.file] : []);

    for (const file of files) {
      const upload = await uploadOnCloudinary(file.path, {
        folder: "expenses",
        public_id: `${req.user.userName}-${Date.now()}`,
      });
      if (!upload?.secure_url) continue;

      attachments.push({
        url: upload.secure_url,
        public_id: upload.public_id,
        fileType: file.mimetype.includes("pdf") ? "pdf" : "image",
      });
    }

    const expense = await Expenses.create({
      date,
      amount: Number(amount),
      narration,
      companyId: user.companyId,
      expenseLedger: {
        id: expenseLedger._id,
        name: expenseLedger.name,
      },

      paidByLedger: {
        id: paidByLedger._id,
        name: paidByLedger.name,
      },

      expenseForLedger: {
        id: expenseForLedger._id,
        name: expenseForLedger.name,
      },

      attachments,
      status: "Draft",
      createdBy: req.user._id,
      expenseCategory,
    });

    const employee = await User.find({ role: "Employee" });
    if (employee.length > 0) {
      for (let emp of employee) {
        sendPushNotification(
          emp._id,
          `${amount} paid by ${user.userName} for ${expenseLedger.name} expense of ${expenseForLedger.name}.`,
        );
      }
    }
    sendApproveByAdmin(expense, "Expense", user._id);

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   POST EXPENSE (ACCOUNTING ENTRY)
====================================================== */
const postExpense = async (req, res) => {
  try {
    const expense = await Expenses.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.status === "Posted" && expense.isApproved !== "Approved") {
      return res
        .status(400)
        .json({ message: "Only Draft expense can be posted" });
    }

    // 🔥 Create voucher
    const voucher = await createVoucher({
      companyId: expense.companyId,
      type: "JOURNAL",
      date: expense.date,
      narration: expense.narration,

      reference: "Expense" + " " + expense.expenseNo,
      referenceId: expense._id,

      costCenterId: expense.expenseForLedger.id,

      entries: [
        {
          ledgerId: expense.expenseLedger.id,
          type: "DEBIT",
          amount: expense.amount,
        },
        {
          ledgerId: expense.paidByLedger.id,
          type: "CREDIT",
          amount: expense.amount,
        },
      ],

      // createdBy: user._id,
    });

    await postVoucher(voucher._id);

    // 🔗 link back
    expense.voucherId = voucher._id;
    expense.status = "Posted";
    await expense.save();

    res.json({ message: "Expense posted successfully", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   CANCEL EXPENSE (REVERSAL)
====================================================== */
const cancelExpense = async (req, res) => {
  try {
    const expense = await Expenses.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (expense.status !== "Posted" && expense.isApproved !== "Approved") {
      return res
        .status(400)
        .json({ message: "Only Posted expense can be cancelled" });
    }

    await cancelVoucher(expense.voucherId);

    expense.status = "Cancelled";
    await expense.save();

    res.json({ message: "Expense cancelled successfully", expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   GET EXPENSES
====================================================== */
const getExpenses = async (req, res) => {
  try {
    const { employeeId, userId, month, year, type, status, approval } =
      req.query;

    let query = {};

    /* -----------------------------
       Resolve employee → user
    ------------------------------ */

    let finalUserId = userId;

    if (employeeId) {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      finalUserId = employee.userId;
    }

    if (finalUserId) {
      query.createdBy = finalUserId;
    }

    /* -----------------------------
       Date Filter
    ------------------------------ */

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      query.date = { $gte: start, $lt: end };
    }

    /* -----------------------------
       Expense Type
    ------------------------------ */

    if (type) {
      query["expenseLedger.id"] = type;
    }

    /* -----------------------------
       Status
    ------------------------------ */

    if (status) query.status = status;

    if (approval) query.isApproved = approval;

    /* -----------------------------
       Fetch Expenses
    ------------------------------ */

    const expenses = await Expenses.find(query)
      .populate("expenseLedger.id")
      .populate("expenseForLedger.id")
      .populate("paidByLedger.id")
      .sort({ date: -1 });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      totalAmount,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenseById = async (req, res) => {
  const expense = await Expenses.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  res.json(expense);
};

/* ======================================================
   UPDATE EXPENSE (DRAFT ONLY)
====================================================== */
const updateExpense = async (req, res) => {
  try {
    const user = req.user;
    const expense = await Expenses.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    /* ----------------------------------
       EDIT PERMISSION CHECK
    ---------------------------------- */
    if (expense.status === "Posted" && expense.isApproved === "Approved") {
      console.log(expense.status, expense.isApproved);
      return res.status(400).json({
        message: "Only Draft & unapproved expenses can be edited",
      });
    }

    const {
      date,
      amount,
      narration,
      expenseCategory,
      expenseLedgerId,
      expenseForLedgerId,
      remarks,
    } = req.body;

    /* ----------------------------------
       LEDGER VALIDATION (IF CHANGED)
    ---------------------------------- */
    if (expenseLedgerId) {
      const expenseLedger = await Ledger.findById(expenseLedgerId);
      if (!expenseLedger) {
        return res.status(400).json({ message: "Invalid expense ledger" });
      }

      expense.expenseLedger = {
        id: expenseLedger._id,
        name: expenseLedger.name,
      };
    }

    if (expenseForLedgerId) {
      const expenseForLedger = await Ledger.findById(expenseForLedgerId);
      if (!expenseForLedger) {
        return res.status(400).json({ message: "Invalid expense-for ledger" });
      }

      expense.expenseForLedger = {
        id: expenseForLedger._id,
        name: expenseForLedger.name,
      };
    }

    /* ----------------------------------
       BASIC FIELD UPDATES
    ---------------------------------- */
    if (date) expense.date = date;
    if (amount !== undefined) expense.amount = Number(amount);
    if (expenseCategory !== undefined)
      expense.expenseCategory = expenseCategory;
    if (narration !== undefined) expense.narration = narration;
    if (remarks !== undefined) expense.remarks = remarks;

    /* ----------------------------------
       ATTACHMENTS (APPEND ONLY)
    ---------------------------------- */

    const files = req.files || (req.file ? [req.file] : []);
    // console.log("first", req.files)

    for (const file of files) {
      const upload = await uploadOnCloudinary(file.path, {
        folder: "expenses",
        public_id: `${req.user.userName}-${Date.now()}`,
      });
      if (!upload?.secure_url) continue;

      expense.attachments.push({
        url: upload.secure_url,
        public_id: upload.public_id,
        fileType: file.mimetype.includes("pdf") ? "pdf" : "image",
      });
    }

    await expense.save();

    const employee = await User.find({ role: "Employee" });
    if (employee.length > 0) {
      for (let emp of employee) {
        sendPushNotification(
          emp._id,
          `${amount} paid by ${user.userName} for ${expense?.expenseLedger.name} expense of ${expense?.expenseForLedger.name}.`,
        );
      }
    }
    sendApproveByAdmin(expense, "Expense", user._id);
    
    await updateVoucher(expense.voucherId);

    res.json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (err) {
    console.error("Update Expense Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   DELETE EXPENSE (DRAFT ONLY)
====================================================== */
const deleteExpense = async (req, res) => {
  const expense = await Expenses.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  if (
    expense.status !== "Draft" &&
    (expense.isApproved !== "Approved" || expense.isApproved !== "Rejected")
  ) {
    return res
      .status(400)
      .json({ message: "Only Draft expense can be deleted" });
  }

  await expense.deleteOne();
  res.json({ message: "Expense deleted" });
};

module.exports = {
  createExpense,
  postExpense,
  cancelExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenses,
};
