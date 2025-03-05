const express = require('express');
const router = express.Router();
const {
    createBonus, createDeduction, createPaymentHistory, createPayroll, createTax, getBonuses, getTaxes, getPaymentHistory, getDeductions, getPayrolls, getPayrollById, updatePayroll, deletePayroll
} = require('../controller/payroll.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// Payroll Routes
router.post('/', createPayroll);
router.get('/', getPayrolls);
router.get('/:id', getPayrollById);
router.put('/:id', updatePayroll);
router.delete('/:id', deletePayroll);

// Deduction Routes
router.post('/', createDeduction);
router.get('/', getDeductions);

// Bonus Routes
router.post('/', createBonus);
router.get('/', getBonuses);

// Payment History Routes
router.post('/', createPaymentHistory);
router.get('/', getPaymentHistory);

// Tax Routes
router.post('/', createTax);
router.get('/', getTaxes);

module.exports = router;
