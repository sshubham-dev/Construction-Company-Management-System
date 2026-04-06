const express = require("express");
const Expenses = express.Router();
const {
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  postExpense,
  cancelExpense,
  getExpenses,
} = require("../controller/expenses.controller"); // Adjust the path as necessary
const { adminAuth, userAuth } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/Upload");

Expenses.post("/", userAuth, upload.array("attachments"), createExpense);
Expenses.get("/", userAuth, getExpenses);
Expenses.get("/:id", userAuth, getExpenseById);
Expenses.put("/post/:id", userAuth, postExpense);
Expenses.put("/cancel/:id", userAuth, cancelExpense);
Expenses.put("/:id", userAuth, upload.array("attachments"), updateExpense);
Expenses.delete("/:id", adminAuth, deleteExpense);

module.exports = Expenses;
