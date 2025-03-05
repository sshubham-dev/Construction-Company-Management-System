const Expenses = require('../models/expenses.models'); // Adjust the path as necessary

// Create a new expense
const createExpense = async (req, res) => {
    try {
        const expense = new Expenses(req.body);
        await expense.save();
        res.status(201).json({ message: 'Expense created successfully', expense });
    } catch (error) {
        res.status(400).json({ message: 'Error creating expense', error });
    }
};

// Get all expenses
const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expenses.find().populate('site by');
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error });
    }
};

// Get a single expense by ID
const getExpenseById = async (req, res) => {
    try {
        const expense = await Expenses.findById(req.params.id).populate('site by');
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expense', error });
    }
};

// Update an expense by ID
const updateExpense = async (req, res) => {
    try {
        const expense = await Expenses.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense updated successfully', expense });
    } catch (error) {
        res.status(400).json({ message: 'Error updating expense', error });
    }
};

// Delete an expense by ID
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expenses.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error });
    }
};

module.exports = { createExpense, getAllExpenses, getExpenseById, updateExpense, deleteExpense }