const Employee = require("../models/employee.models");
const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const { convertToUser } = require("./user.controller");
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");

const employeeById = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await Employee.findById(id);

    if (!employee) return res.status(500).json({ error: "Employee not Found" });
    res.status(200).json(employee);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const employees = async (req, res) => {
  try {
    const employees = await Employee.find()
    .where('status').equals('Active')
    .sort({ name: 1 })
    .exec();

    if (employees.length === 0)
      return res.status(500).json({ error: "Employees not Found" });
    res.status(200).json(employees);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const DEPARTMENT_CODE_MAP = {
  "Accountant": "ACC",
  "Marketing": "MKT",
  "Ceo": "CEO",
  "Site Incharge": "SI",
  "Site Supervisor": "SS",
  "Design Engineer": "DES",
  "Quality Engineer": "QE",
  "Store Incharge": "STI",
  "H.R": "HR",
  "Account Head": "AH",
  "Store Helper": "SH",
};

async function generateSerialNo(department) {
  const deptCode = DEPARTMENT_CODE_MAP[department];

  if (!deptCode) {
    throw new Error("Invalid department");
  }

  const lastEmployee = await Employee.findOne({ department })
    .sort({ createdAt: -1 })
    .select("employeeID");

  let nextSerial = 1;

  if (lastEmployee?.employeeID) {
    const parts = lastEmployee.employeeID.split("-");
    const lastSerial = parseInt(parts[1], 10);
    if (!isNaN(lastSerial)) {
      nextSerial = lastSerial + 1;
    }
  }

  return `${deptCode}-${String(nextSerial).padStart(3, "0")}`;
}

const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      whatsapp,
      joinDate,
      birthdate,
      address,

      role,
      department,
      reportingManagerId,
      businessUnitId,
      baseSalary,
      status,
      isUser,

      addhar,
      panNo,
      cv,
      offerletter,
      bank,

      incentiveConfig,
    } = req.body;

    /* ================= VALIDATIONS ================= */

    if (!name || !department) {
      return res.status(400).json({
        error: "Name and Department are required",
      });
    }

    /* ================= UNIQUE EMAIL CHECK ================= */

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({
        error: "Employee with same email already exists",
      });
    }

    /* ===== INCENTIVE CLEAN ===== */

    let cleanIncentiveConfig = incentiveConfig;
    if (cleanIncentiveConfig?.targets?.length) {
      cleanIncentiveConfig.targets = cleanIncentiveConfig.targets
        .filter((t) => t.targetType && t.bonusType)
        .map((t) => ({
          ...t,
          bonusType: t.bonusType.toUpperCase(),
        }));
    }

    /* ===== GENERATE EMPLOYEE ID ===== */
    const employeeID = await generateSerialNo(department);

    /* ================= CREATE EMPLOYEE ================= */

    const employee = new Employee({
      name,
      email,
      phone,
      whatsapp,
      employeeID,
      joinDate,
      birthdate,
      address,

      role,
      department,
      reportingManagerId: reportingManagerId || null,
      businessUnitId: businessUnitId || null,
      baseSalary,
      status,
      isUser,

      addhar,
      panNo,
      cv,
      offerletter,
      bank,

      incentiveConfig,
    });

    const createdEmployee = await employee.save();

    /* ================= USER CONVERSION ================= */

    if (createdEmployee.isUser === true) {
      const password = `${createdEmployee.name}@${createdEmployee.phone}`;
      await convertToUser(createdEmployee._id, "Employee", password, "Create");
    }

    return res.status(201).json({
      message: "Employee created successfully",
      employee: createdEmployee,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    return res.status(500).json({
      error: "Something went wrong while creating employee",
    });
  }
};

const updateEmployeeData = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      whatsapp,
      address,
      birthdate,
      joinDate,

      role,
      department,
      reportingManagerId,
      businessUnitId,
      baseSalary,
      status,
      isUser,

      addhar,
      pan,
      cv,
      offerletter,
      bank,

      incentiveConfig,
    } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    /* ===== GENERATE EMPLOYEE ID ===== */
    const employeeID = await generateSerialNo(department);

    // 🔁 Update basic + company fields safely
    Object.assign(employee, {
      name,
      email,
      phone,
      whatsapp,
      employeeID,
      address,
      birthdate,
      joinDate,

      role,
      department,
      reportingManagerId,
      businessUnitId,
      baseSalary,
      status,

      addhar,
      panNo: pan,
      cv,
      offerletter,
      bank,
    });

    // Boolean safety
    employee.isUser = isUser === true || isUser === "true";

    /* ===== INCENTIVE CLEAN ===== */
    if (incentiveConfig) {
      employee.incentiveConfig = incentiveConfig;
    }
    let cleanIncentiveConfig = incentiveConfig;
    if (cleanIncentiveConfig?.targets?.length) {
      cleanIncentiveConfig.targets = cleanIncentiveConfig.targets
        .filter((t) => t.targetType && t.bonusType)
        .map((t) => ({
          ...t,
          bonusType: t.bonusType.toUpperCase(),
        }));
    }

    await employee.save();

    // 🔐 Convert / update user if needed
    if (employee.isUser === true) {
      const password = `${employee.name}@${employee.phone}`;
      const mode = employee.userId ? "Update" : "Create";
      await convertToUser(employee._id, "Employee", password, mode);
    }

    return res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    // Validate ID
    if (!id || id === "undefined") {
      return res
        .status(400)
        .json({ message: "Invalid or missing Employee ID" });
    }
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee)
      return res.status(404).json({ error: "Employee not Found" });
    await User.findByIdAndDelete(deletedEmployee.userId);
    res
      .status(200)
      .json({ message: "Employee deleted Successfuly", deletedEmployee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  employeeById,
  employees,
  createEmployee,
  updateEmployeeData,
  deleteEmployee,
};
