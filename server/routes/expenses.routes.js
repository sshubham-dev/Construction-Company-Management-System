const express = require('express');
const Expenses = express.Router();
const { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense } = require('../controller/expenses.controller'); // Adjust the path as necessary
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

Expenses.post('/', createExpense);
Expenses.get('/', getAllExpenses);
Expenses.get('/:id', getExpenseById);
Expenses.put('/:id', updateExpense);
Expenses.delete('/:id', deleteExpense);

module.exports = Expenses;