const Employee = require('../models/employee.models');
const User = require('../models/user.models');
const bcrypt = require('bcrypt');
const { convertToUser } = require('./user.controller');


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
        } = req.body;

        const employeeExist = await Employee.findOne({
            $and: [{ name }, { email }, { employeeNo }]
        });
        console.log('employeeExist',employeeExist)

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
            pan,
            cv,
            offerletter,
            bank,
            isUser
        });

        const createdEmployee = await newEmployee.save();

        if (!createdEmployee) return res.status(500).json({ error: 'Validation Error' });
        res.status(200).json({ message: 'Employee Registration Completed Successfully' });
        console.log('saved:', createdEmployee)
        if (createdEmployee.isUser === true) { 
            console.log('Converting to user:', createdEmployee._id);
            const password = `${name}@${phone}`;
            await convertToUser(createdEmployee._id, 'Employee', password);
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
        } = req.body;

        console.log('Received Data:', req.body);

        // Ensure `isUser` is boolean
        const isUserBoolean = isUser === 'true' || isUser === true;

        // Check and update Employee
        const updatedEmployeeData = await Employee.findByIdAndUpdate(
            id,
            {
                $set: {
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
                    isUser: isUserBoolean,
                },
            },
            { new: true }
        );

        if (!updatedEmployeeData) return res.status(404).json({ error: 'Employee not Found' });

        console.log('Updated Employee:', updatedEmployeeData);

        // Convert Employee to User if `isUser` is true and `userId` is missing
        if (updatedEmployeeData.isUser === true && !updatedEmployeeData.userId) {
            console.log('Converting to user:', updatedEmployeeData._id);
            const employeePassword = `${updatedEmployeeData.name}@${updatedEmployeeData.contactNo}`;
            await convertToUser(updatedEmployeeData._id, 'Employee', employeePassword);
        }

        res.status(200).json({ message: 'Employee Data Updated Successfully', updatedEmployeeData });

    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};



const deleteEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedEmployee = await Employee.findByIdAndDelete(id);
        if (!deletedEmployee) return res.status(404).json({ error: 'Employee not Found' });
        res.status(200).json({ message: 'Employee deleted Successfuly', deletedEmployee });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something went wrong" });
    }
};


module.exports = { employeeById, employees, createEmployee, updateEmployeeData, deleteEmployee };