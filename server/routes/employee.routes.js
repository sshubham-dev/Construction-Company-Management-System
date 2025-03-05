const express = require('express');
const { employees, employeeById, updateEmployeeData, deleteEmployee, createEmployee } = require('../controller/employee.controller');
const Employee = express.Router();
const upload = require('../middlewares/Upload');
const multer = require('multer');


Employee.get('/', employees);
Employee.post('/', (req, res, next) => {
    upload.fields([
        { name: 'addhar', maxCount: 2 },
        { name: 'pan', maxCount: 1 },
        { name: 'cv', maxCount: 1 },
        { name: 'offerletter', maxCount: 1 },
        { name: 'bank', maxCount: 1 },
    ])(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: 'Multer error', details: err.message });
        } else if (err) {
            return res.status(500).json({ error: 'Internal server error', details: err.message });
        }
        // Continue to the next middleware or route handler
        next();
    });
}, createEmployee);



Employee.route('/:id')
    .get(employeeById)
    .put(updateEmployeeData)
    .delete(deleteEmployee);


module.exports = Employee;