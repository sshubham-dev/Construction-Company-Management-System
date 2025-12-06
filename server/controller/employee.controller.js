const Employee = require('../models/employee.models');
const User = require('../models/user.models');
const bcrypt = require("bcryptjs");
const { convertToUser } = require('./user.controller');
const { sendNotification } = require("./notification.controller.js");

const employeeById = async (req, res) => {
    try {
        const _id = req.params.id;
        const employee = await Employee.findOne({ _id })

        if (!employee) return res.status(500).json({ error: 'Employee not Found' });
        res.status(200).json(employee);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something went wrong" });
    }
};


const employees = async (req, res) => {
    try {
        const employees = await Employee.find()

        if (employees.length === 0) return res.status(500).json({ error: 'Employees not Found' });
        res.status(200).json(employees);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something went wrong" });
    }
};


const createEmployee = async (req, res) => {
    try {
        console.log('res', req.body);
        const {
            name,
            email,
            phone,
            whatsapp,
            employeeNo,
            joinDate,
            birthdate,
            address,
            addhar,
            pan,
            cv,
            offerletter,
            bank,
            isUser,
            department,
            status,
        } = req.body;

        const employeeExist = await Employee.findOne({
            $and: [{ name }, { email }, { employeeNo }]
        });
        console.log('employeeExist', employeeExist)

        if (employeeExist) return res.status(400).json({ error: 'Validation Error' });

        const newEmployee = new Employee({
            name,
            email,
            whatsapp,
            phone,
            address,
            employeeNo,
            joinDate,
            department,
            birthdate,
            addhar,
            panNo: pan,
            cv,
            offerletter,
            bank,
            status,
            isUser
        });

        const createdEmployee = await newEmployee.save();

        if (!createdEmployee) return res.status(500).json({ error: 'Validation Error' });
        res.status(200).json({ message: 'Employee Registration Completed Successfully' });
        console.log('saved:', createdEmployee)
        if (createdEmployee.isUser === true) {
            console.log('Converting to user:', createdEmployee._id);
            const password = `${name}@${phone}`;
            await convertToUser(createdEmployee._id, 'Employee', password, 'Create');
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong' });
    }
};


const updateEmployeeData = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      email,
      password,
      contactNo,
      whatsapp,
      employeeNo,
      address,
      addhar,
      pan,
      cv,
      offerletter,
      bank,
      joinDate,
      department,
      birthdate,
      salary,
      salarySlip,
      isUser,
      status,
    } = req.body;

    console.log('Received Data:', req.body);

    // Ensure `isUser` is a proper boolean
    const isUserBoolean = isUser === 'true' || isUser === true;

    // Fetch employee
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Update fields
    employee.name = name;
    employee.email = email;
    employee.password = password;
    employee.contactNo = contactNo;
    employee.whatsapp = whatsapp;
    employee.employeeNo = employeeNo;
    employee.address = address;
    employee.addhar = addhar;
    employee.panNo = pan;
    employee.cv = cv;
    employee.offerletter = offerletter;
    employee.bank = bank;
    employee.joinDate = joinDate;
    employee.department = department;
    employee.birthdate = birthdate;
    employee.salary = salary;
    employee.salarySlip = salarySlip;
    employee.isUser = isUserBoolean;
    employee.status = status;

    await employee.save(); // 🔥 Triggers pre('save') hook for ledger sync

    // Convert to user if needed
    if (employee.isUser === true) {
      const employeePassword = `${employee.name}@${employee.contactNo}`;
      const mode = employee.userId ? 'Update' : 'Create';
      console.log(`${mode} User for:`, employee._id);
      await convertToUser(employee._id, 'Employee', employeePassword, mode);
    }

    res.status(200).json({
      message: 'Employee Data Updated Successfully',
      updatedEmployeeData: employee,
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};




const deleteEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        // Validate ID
        if (!id || id === "undefined") {
            return res.status(400).json({ message: "Invalid or missing Employee ID" });
        }
        const deletedEmployee = await Employee.findByIdAndDelete(id);
        if (!deletedEmployee) return res.status(404).json({ error: 'Employee not Found' });
        await User.findByIdAndDelete(deletedEmployee.userId);
        res.status(200).json({ message: 'Employee deleted Successfuly', deletedEmployee });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something went wrong" });
    }
};


module.exports = { employeeById, employees, createEmployee, updateEmployeeData, deleteEmployee };