const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

// Payroll Routes
router.post('/payroll', payrollController.createPayroll);
router.get('/payroll', payrollController.getPayrolls);
router.get('/payroll/:id', payrollController.getPayrollById);
router.put('/payroll/:id', payrollController.updatePayroll);
router.delete('/payroll/:id', payrollController.deletePayroll);

// Deduction Routes
router.post('/deduction', payrollController.createDeduction);
router.get('/deduction', payrollController.getDeductions);

// Bonus Routes
router.post('/bonus', payrollController.createBonus);
router.get('/bonus', payrollController.getBonuses);

// Payment History Routes
router.post('/payment-history', payrollController.createPaymentHistory);
router.get('/payment-history', payrollController.getPaymentHistory);

// Tax Routes
router.post('/tax', payrollController.createTax);
router.get('/tax', payrollController.getTaxes);

module.exports = router;
