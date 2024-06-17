const Employee = require('../models/employee.models');
const User = require('../models/user.models');
const bcrypt = require('bcrypt');



const employeeById = async (req, res) => {
    try {
        const _id = req.params.id;
        const employee = await Employee.findOne({ _id })
            .populate('userId')
            .exec();

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
            .populate('userId')
            .exec();

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
            password,
            contactNo,
            whatsapp,
            employeeId,
            joinDate,
            birthdate,
            address,
            addhar,
            pan,
            cv,
            offerletter,
            bank,
        } = req.body;


        const employeeExist = await Employee.findOne({
            $and: [{ name }, { email }, { employeeId }]
        });
        console.log(employeeExist)

        if (employeeExist) return res.status(400).json({ error: 'Validation Error' });

        const existingUser = await User.findOne({
            $and: [{ userName: name }, { userMail: email }]
        }).select('-password -refreshToken');

        if (!existingUser) return res.status(400).json({ error: 'User not found' });
        console.log('exist', existingUser)

        // Hash the password for the employee
        const hashedPassword = await bcrypt.hash(password, 10);

        const newEmployee = new Employee({
            userId: existingUser._id,
            name,
            email,
            password: hashedPassword,
            whatsapp,
            contactNo,
            address,
            employeeId,
            joinDate,
            department: existingUser.department,
            birthdate,
            addhar,
            pan,
            cv,
            offerletter,
            bank,
        });

        const createdEmployee = await newEmployee.save();

        if (!createdEmployee) return res.status(500).json({ error: 'Validation Error' });
        console.log('saved:', createdEmployee)
        res.status(200).json({ message: 'Employee Registration Completed Successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong' });
    }
};


const updateEmployeeData = async (req, res) => {
    try {
        const _id = req.params.id;
        const {
            userId,
            name,
            email,
            password,
            contactNo,
            whatsapp,
            employeeId,
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
        } = req.body;

        // check and update Employee
        const updatedEmployeeData = await Employee.findOneAndUpdate({ _id },
            {
                $set: {
                    userId,
                    name,
                    email,
                    password,
                    contactNo,
                    whatsapp,
                    employeeId,
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
                },
            }, { new: true }).populate('user').exec();
        if (!updatedEmployeeData) return res.status(404).json({ error: 'Employee not Found' });

        res.status(200).json({ message: 'Employee Data Updated Successfuly', updatedEmployeeData });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something went wrong" });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const _id = req.params.id;
        const deletedEmployee = await Employee.findOneAndDelete({ _id });
        if (!deletedEmployee) return res.status(404).json({ error: 'Employee not Found' });
        res.status(200).json({ message: 'Employee deleted Successfuly', deletedEmployee });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Something went wrong" });
    }
};

module.exports = { employeeById, employees, createEmployee, updateEmployeeData, deleteEmployee };