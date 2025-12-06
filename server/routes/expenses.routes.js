const express = require('express');
const Expenses = express.Router();
const { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense } = require('../controller/expenses.controller'); // Adjust the path as necessary
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/Upload');


Expenses.post('/', userAuth, upload.single('photo'), createExpense);
Expenses.get('/', userAuth, getAllExpenses);
Expenses.get('/:id', userAuth, getExpenseById);
Expenses.put('/:id', userAuth, upload.single('photo'), updateExpense);
Expenses.delete('/:id', adminAuth, deleteExpense);

module.exports = Expenses;