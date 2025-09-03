const User = require('../models/user.models'); // Assuming you have a User model    
const { Ledger } = require('../models/ledger.models'); // ✅ Fix import
const Expenses = require('../models/expenses.models'); // ✅ your expense schema
const { uploadOnCloudinary } = require('../utils/cloudinary'); // ✅ adjust as needed


// Create a new expense

const createExpense = async (req, res) => {
    try {
        const { date, amount, to, type, purpose } = req.body;
        const user = req.user;
        const billPath = req.file?.path;

        if (!billPath) return res.status(400).json({ message: 'Photo is required' });

        // Upload to cloudinary
        const upload = await uploadOnCloudinary(billPath);

        // Find user's ledger
        const fromLedger = await Ledger.findById(user.ledgerId);
        if (!fromLedger) return res.status(404).json({ message: 'Ledger not found for user' });

        // Create new expense
        const newExpense = new Expenses({
            date,
            amount,
            from: user.ledgerId,
            to,
            type,
            purpose,
            createdBy: user._id,
            photo: upload?.url,
        });

        await newExpense.save();

        // Update ledger balances
        fromLedger.currentBalance -= amount;
        fromLedger.paid += amount;
        fromLedger.transaction.push({
            id: newExpense._id,
            type: 'Expense',
            amount,
            date,
        });
        await fromLedger.save();

        const toLedger = await Ledger.findById(to);
        if (toLedger) {
            toLedger.currentBalance += amount;
            toLedger.received += amount;
            toLedger.transaction.push({
                id: newExpense._id,
                type: 'Expense',
                amount,
                date,
            });
            await toLedger.save();
        }

        return res.status(201).json({ message: 'Expense recorded successfully', data: newExpense });
    } catch (error) {
        console.error('Error recording expense:', error);
        return res.status(500).json({ message: 'Internal Server Error', error });
    }
};


// Get all expenses
const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expenses.find()
            .populate('to')
            .sort({ date: -1 })
            .exec();
        if (!expenses || expenses.length === 0) {
            return res.status(404).json({ message: 'No expenses found' });
        }

        res.status(201).json(expenses);
    } catch (error) {
        clg.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Failed to fetch expenses', error });
    }
};

// Get a single expense by ID
const getExpenseById = async (req, res) => {
    try {
        const expense = await Expenses.findById(req.params.id)
            .populate('from', 'name')
            .populate('to', 'name')
            .sort({ date: -1 });
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