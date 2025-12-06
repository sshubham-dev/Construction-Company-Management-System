const User = require("../models/user.models"); // Assuming you have a User model
const { Ledger } = require("../models/ledger.models"); // ✅ Fix import
const Expenses = require("../models/expenses.models"); // ✅ your expense schema
const uploadOnCloudinary = require("../utils/cloudinary"); // ✅ adjust as needed
const Employee = require("../models/employee.models");
const { sendApproveByAdmin } = require("./approval.controller.js");
const { sendNotification } = require("./notification.controller.js");

// Create a new expense

const createExpense = async (req, res) => {
  try {
    const { date, amount, to, type, purpose, paymentMode } = req.body;
    const user = req.user;
    const billPath = req.file?.path;

    // Upload bill if provided
    let upload;
    if (billPath) {
      upload = await uploadOnCloudinary(billPath);
    }

    // Find employee and their ledger
    const employee = await Employee.findOne({ userId: user._id });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const fromLedger = await Ledger.findById(employee.ledger);
    if (!fromLedger)
      return res.status(404).json({ message: "Ledger not found" });

    const toLedger = await Ledger.findById(to);
    if (!toLedger) return res.status(404).json({ message: "Ledger not found" });

    // Create expense document
    const newExpense = new Expenses({
      date,
      amount: Number(amount),
      from: fromLedger._id,
      to: toLedger._id,
      type,
      purpose,
      createdBy: user._id,
      photo: upload?.url || "",
    });
    await newExpense.save();

    // Ledger updates helper
    const createLedgerEntry = async ({
      ledger,
      counterpartLedgerId,
      amount,
      drCr,
      balanceAfter,
    }) => {
      ledger.transactions.push({
        date,
        narration: purpose,
        debitAccount: drCr === "Dr" ? ledger._id : counterpartLedgerId,
        creditAccount: drCr === "Cr" ? ledger._id : counterpartLedgerId,
        amount: Number(amount),
        voucherType: "Expenses",
        voucherRef: newExpense._id,
        paymentMode: paymentMode || "",
        drCr,
        counterpartLedger: counterpartLedgerId,
        balanceAfter,
      });
      await ledger.save();
    };

    // Update From Ledger (credit)
    fromLedger.currentBalance -= Number(amount);
    fromLedger.summary.paid = (fromLedger.summary.paid || 0) + Number(amount);
    fromLedger.summary.receivable =
      (fromLedger.summary.receivable || 0) + Number(amount);
    await createLedgerEntry({
      ledger: fromLedger,
      counterpartLedgerId: toLedger._id,
      amount,
      drCr: "Cr",
      balanceAfter: fromLedger.currentBalance,
    });

    // Update To Ledger (debit)

    if (toLedger) {
      toLedger.currentBalance += Number(amount);
      toLedger.summary.received =
        (toLedger.summary.received || 0) + Number(amount);
      await createLedgerEntry({
        ledger: toLedger,
        counterpartLedgerId: fromLedger._id,
        amount,
        drCr: "Dr",
        balanceAfter: toLedger.currentBalance,
      });
    }

    // Optional: Notify for approval
    sendApproveByAdmin(newExpense, "Expenses", user._id);

    return res
      .status(201)
      .json({ message: "Expense recorded successfully", data: newExpense });
  } catch (error) {
    console.error("Error recording expense:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get all expenses
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expenses.find()
      .where("createdBy")
      .equals(req.user._id)
      .populate("to")
      .sort({ date: -1 })
      .exec();
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }

    res.status(201).json(expenses);
  } catch (error) {
    clg.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Failed to fetch expenses", error });
  }
};

// Get a single expense by ID
const getExpenseById = async (req, res) => {
  try {
    console.log("Fetching expense with ID:", req.params.id);
    const expense = await Expenses.findById(req.params.id)
      .populate("from")
      .populate("to")
      .exec();
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ message: "Error fetching expense", error });
  }
};

// Update an expense by ID
const updateExpense = async (req, res) => {
  try {
    // console.log('Updating expense with ID:', req.params.id);
    console.log("Updating expense:", req.body);
    const billPath = req.file?.path;
    if (!billPath)
      return res.status(400).json({ message: "Photo is required" });
    const upload = await uploadOnCloudinary(billPath);
    const { date, amount, to, type, purpose } = req.body;
    const expense = await Expenses.findByIdAndUpdate(
      req.params.id,
      {
        date,
        amount,
        to,
        type,
        purpose,
        photo: upload?.url,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    console.log("Updated expense:", expense);
    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(400).json({ message: "Error updating expense", error });
  }
};

// Delete an expense by ID
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expenses.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
