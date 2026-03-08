const { Ledger } = require("../models/ledger.models"); // ✅ Fix import
const Expenses = require("../models/expenses.models"); // ✅ your expense schema
const {uploadOnCloudinary} = require("../utils/cloudinary"); // ✅ adjust as needed
const Employee = require("../models/employee.models");
const {
  sendApproveByAdmin,
  sendApproveByAccountHead,
} = require("./approval.controller.js");
const User = require("../models/user.models");
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");

const resolvePaidByLedger = async (userId) => {
  const employee = await Employee.findOne({ userId });
  if (!employee) throw new Error("Employee not found");

  const ledger = await Ledger.findById(employee.ledger);
  if (!ledger) throw new Error("Employee ledger not found");

  return ledger;
};

const applyExpenseToLedgers = async (expense, mode = "add") => {
  const multiplier = mode === "add" ? 1 : -1;
  const amount = Number(expense.amount);

  const expenseLedger = await Ledger.findById(expense.expenseLedger.id);
  const expenseForLedger = await Ledger.findById(expense.expenseForLedger.id);
  const paidByLedger = await Ledger.findById(expense.paidByLedger.id);

  if (!expenseLedger || !paidByLedger || !expenseForLedger) {
    throw new Error("Ledger missing for posting expense");
  }

  // Debit Expense Ledger
  expenseLedger.currentBalance =
    (expenseLedger.currentBalance || 0) + multiplier * amount;

  expenseForLedger.currentBalance =
    (expenseForLedger.currentBalance || 0) + multiplier * amount;
  expenseForLedger.received =
    (expenseForLedger.received || 0) + multiplier * amount;

  // Credit Paid By Ledger (company owes employee)
  paidByLedger.currentBalance =
    (paidByLedger.currentBalance || 0) - multiplier * amount;
  paidByLedger.paid = (paidByLedger.paid || 0) + multiplier * amount;

  await expenseLedger.save();
  await paidByLedger.save();
  await expenseForLedger.save();
};

/* ======================================================
   CREATE EXPENSE (DRAFT)
====================================================== */
const createExpense = async (req, res) => {
  try {
    const { date, amount, narration, expenseLedgerId, expenseForLedgerId } =
      req.body;
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
    });

    const employee = await User.find({ role: "Employee" });
    if (employee.length > 0) {
      for (let emp of employee) {
        sendPushNotification(
          emp._id,
          `${amount} paid by ${user.userName} for ${expenseLedger.name} expense of ${expenseForLedger.name}.`
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

    await applyExpenseToLedgers(expense, "add");

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

    await applyExpenseToLedgers(expense, "subtract");

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
const getAllExpenses = async (req, res) => {
  const expenses = await Expenses.find().sort({ createdAt: -1 });
  res.json(expenses);
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
          `${amount} paid by ${user.userName} for ${expense?.expenseLedger.name} expense of ${expense?.expenseForLedger.name}.`
        );
      }
    }
    sendApproveByAdmin(expense, "Expense", user._id);
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
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
