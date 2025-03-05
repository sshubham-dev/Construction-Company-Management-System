const { Payroll, Deduction, Bonus, PaymentHistory, Tax } = require('../models/payroll.models');

// Create Payroll
const createPayroll = async (req, res) => {
    try {
        const payroll = new Payroll(req.body);
        await payroll.save();
        res.status(201).json(payroll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Payrolls
const getPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find().populate('employee');
        res.status(200).json(payrolls);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Payroll by ID
const getPayrollById = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate('employee');
        if (!payroll) return res.status(404).json({ error: 'Payroll not found' });
        res.status(200).json(payroll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Payroll
const updatePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!payroll) return res.status(404).json({ error: 'Payroll not found' });
        res.status(200).json(payroll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Payroll
const deletePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findByIdAndDelete(req.params.id);
        if (!payroll) return res.status(404).json({ error: 'Payroll not found' });
        res.status(200).json({ message: 'Payroll deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Deduction
const createDeduction = async (req, res) => {
    try {
        const deduction = new Deduction(req.body);
        await deduction.save();
        res.status(201).json(deduction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Deductions
const getDeductions = async (req, res) => {
    try {
        const deductions = await Deduction.find();
        res.status(200).json(deductions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Bonus
const createBonus = async (req, res) => {
    try {
        const bonus = new Bonus(req.body);
        await bonus.save();
        res.status(201).json(bonus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Bonuses
const getBonuses = async (req, res) => {
    try {
        const bonuses = await Bonus.find();
        res.status(200).json(bonuses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Payment History
const createPaymentHistory = async (req, res) => {
    try {
        const paymentHistory = new PaymentHistory(req.body);
        await paymentHistory.save();
        res.status(201).json(paymentHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Payment History
const getPaymentHistory = async (req, res) => {
    try {
        const paymentHistory = await PaymentHistory.find().populate('payroll');
        res.status(200).json(paymentHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create Tax
const createTax = async (req, res) => {
    try {
        const tax = new Tax(req.body);
        await tax.save();
        res.status(201).json(tax);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Taxes
const getTaxes = async (req, res) => {
    try {
        const taxes = await Tax.find();
        res.status(200).json(taxes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createBonus, createDeduction, createPaymentHistory, createPayroll, createTax, getBonuses, getTaxes, getPaymentHistory, getDeductions, getPayrolls, getPayrollById, updatePayroll, deletePayroll
}