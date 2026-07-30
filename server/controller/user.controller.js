const User = require("../models/user.models");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
// const cloudinary = require('../utils/cloudinary.js');
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const Employee = require("../models/employee.models.js");
const Supplier = require("../models/supplier.models.js");
const Contractor = require("../models/contractor.models.js");
const Client = require("../models/client.models.js");

const register = async (req, res) => {
  try {
    const { userName, userMail, password, phone, whatsapp, newPassword } =
      req.body;
    const avatarLocalPath = req.file?.path;
    // console.log(req.file?.path)

    if (!(userName, userMail, password)) {
      return res.status(404).json({ error: "All fields are required" });
    }
    let upload = await uploadOnCloudinary(avatarLocalPath, {
      folder: "users/avatars",
      public_id: `${userName}-${Date.now()}`,
    });
    // console.log(upload)
    const isCompany = process.env.COMPANY_EMAIL;
    if (userMail === isCompany) {
      const isCompanyExists = await User.find()
        .where("userMail")
        .equals(userMail)
        .where("department")
        .equals("Company")
        .where("role")
        .equals("Admin")
        .exec();

      if (isCompanyExists.length === 0 && isCompanyExists.length < 1) {
        const createCompany = new User({
          userName,
          userMail,
          password,
          phone,
          whatsapp,
          avatar: {
            secure_url: upload?.secure_url || null,
            public_id: upload?.public_id || null,
          },
          role: "Admin",
          department: "Company",
        });
        const savedCompany = await createCompany.save();
        const company = await User.findById(savedCompany._id);
        if (!company) {
          return res.status(501).json({ error: "Error creating Company" });
        } else {
          return res.status(201).json({ message: "Registrated Successfuly" });
        }
      } else if (isCompanyExists.length === 1) {
        res.status(500).json({ message: "Company Already Exists" });
      }
    } else {
      const userExist = await User.findOne({ userMail });
      if (userExist) {
        const isPasswordValid = await userExist.isPasswordCorrect(password);
        if (isPasswordValid && newPassword) {
          userExist.avatar = {
            secure_url:
              upload?.secure_url || userExist.avatar?.secure_url || null,
            public_id: upload?.public_id || userExist.avatar?.public_id || null,
          };
          console.log(newPassword);
          userExist.password = newPassword;
          await userExist.save({ validateBeforeSave: false });
          return res.status(201).json({ message: "Registration successfully" });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const createUser = async (req, res) => {
  try {
    const { userName, userMail, password, phone, role, department, companyId } =
      req.body;
    const userExist = await User.findOne({
      $and: [{ userName }, { department }],
    });
    if (userExist) return res.status(400).json({ error: "Validation Error" });
    const newUser = new User({
      userName,
      userMail,
      password,
      phone,
      role,
      department,
      companyId,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const convertToUser = async (id, role, password, status) => {
  try {
    switch (role) {
      case "Employee":
        // console.log("Finding Employee");
        const employee = await Employee.findById(id);
        // console.log('employee', employee)
        if (!employee) return "Employee not Found";
        // console.log("Found Employee");
        // console.log("Finding User");
        const employeeUser = await User.findOne({
          $and: [
            { _id: employee?.userId },
            // { userName: employee.name },
            // { department: employee.department },
            // { companyId: employee.companyId },
          ],
        });
        if (employeeUser)
          console.log("Found User");
        if (status === "Update") {
          console.log(employeeUser.userName)
          employeeUser.userName = employee.name || employeeUser.userName;
          employeeUser.userMail = employee.email || employeeUser.userMail;
          employeeUser.phone = employee.phone || employeeUser.phone;
          employeeUser.whatsapp = employee.whatsapp || employeeUser.whatsapp;
          employeeUser.department =
            employee.department || employeeUser.department;
          employeeUser.role = role || employeeUser.role;
          employeeUser.status = employee.status || employeeUser.status;
          // employeeUser.password = password || employeeUser.password;
          employeeUser.companyId = employee.companyId || employeeUser.companyId;
          employeeUser.ledger = employee.ledger || employeeUser.ledger;
          employeeUser.businessUnitId =
            employee.businessUnitId || employeeUser.businessUnitId;
          // console.log(employee.companyId);
          await employeeUser.save();
        } else if (status === "Create") {
          const newEmployeeUser = new User({
            userName: employee?.name,
            userMail: employee.email,
            password,
            phone: employee.phone,
            whatsapp: employee.whatsapp,
            role,
            department: employee.department,
            companyId: employee.companyId,
            businessUnitId: employee.businessUnitId,
            ledger: employee.ledger,
          });
          const savedEmployeeUser = await newEmployeeUser.save();
          employee.userId = savedEmployeeUser._id;
          await employee.save({ validateBeforeSave: false });
        }
        break;

      case "Client":
        const client = await Client.findById(id);
        if (!client) return "Client not Found";
        const clientUser = await User.findOne({
          $and: [
            // { _id: client?.userId },
            { userName: client.name },
            // { companyId: client.companyId },
            { department: "Client" },
          ],
        });
        if (clientUser)
          if (status === "Update") {
            clientUser.userName = client.name || clientUser.userName;
            clientUser.userMail = client.email || clientUser.userMail;
            clientUser.phone = client.phone || clientUser.phone;
            clientUser.whatsapp = client.whatsapp || clientUser.whatsapp;
            clientUser.department = client.department || clientUser.department;
            clientUser.role = role || clientUser.role;
            clientUser.password = password || clientUser.password;
            clientUser.companyId = client.companyId || clientUser.companyId;
            clientUser.ledger = client.ledger || clientUser.ledger;
            clientUser.businessUnitId =
              client.businessUnitId || clientUser.businessUnitId;
            await clientUser.save();
          } else if (status === "Create") {
            const newClientUser = new User({
              userName: client.name,
              userMail: client.email,
              password,
              phone: client.phone,
              whatsapp: client.whatsapp,
              role,
              department: "Client",
              companyId: client.companyId,
              businessUnitId: employee.businessUnitId,
              ledger: employee.ledger,
            });
            const savedClientUser = await newClientUser.save();
            client.userId = savedClientUser._id;
            await client.save({ validateBeforeSave: false });
          }
        break;

      case "Contractor":
        const contractor = await Contractor.findById(id);
        if (!contractor) return "Contractor not found";
        const contractorUser = await User.findOne({
          $and: [
            // { _id: contractor.userId },
            { userName: contractor.name },
            // { companyId: contractor.companyId },
            { department: "Contractor" },
          ],
        });
        if (contractorUser)
          if (status === "Update") {
            contractorUser.userName = contractor.name || contractorUser.userName;
            contractorUser.userMail = contractor.email || contractorUser.userMail;
            contractorUser.phone = contractor.phone || contractorUser.phone;
            contractorUser.whatsapp =
              contractor.whatsapp || contractorUser.whatsapp;
            contractorUser.department =
              contractor.department || contractorUser.department;
            contractorUser.role = role || contractorUser.role;
            contractorUser.password = password || contractorUser.password;
            contractorUser.companyId =
              contractor.companyId || contractorUser.companyId;
            contractorUser.ledger = contractor.ledger || contractorUser.ledger;
            contractorUser.businessUnitId =
              contractor.businessUnitId || contractorUser.businessUnitId;
            await contractorUser.save();
          } else if (status === "Create") {
            const newContractorUser = new User({
              userName: contractor.name,
              userMail: contractor.email,
              password,
              phone: contractor.phone,
              whatsapp: contractor.whatsapp,
              role,
              department: "Contractor",
              companyId: contractor.companyId,
              businessUnitId: contractor.businessUnitId,
              ledger: contractor.ledger,
            });
            const savedContractorUser = await newContractorUser.save();
            contractor.userId = savedContractorUser._id;
            await contractor.save({ validateBeforeSave: false });
          }
        break;

      case "Supplier":
        supplier = await Supplier.findById(id);
        if (!supplier) {
          return "Supplier not found";
        }
        const supplierUser = await User.findOne({
          $and: [
            // { _id: supplier.userId },
            { userName: supplier.name },
            // { companyId: supplier.companyId },
            { department: "Supplier" },
          ],
        });
        if (supplierUser)
          if (status === "Update") {
            supplierUser.userName = supplier.name || supplierUser.userName;
            supplierUser.userMail = supplier.email || supplierUser.userMail;
            supplierUser.phone = supplier.phone || supplierUser.phone;
            supplierUser.whatsapp = supplier.whatsapp || supplierUser.whatsapp;
            supplierUser.department =
              supplier.department || supplierUser.department;
            supplierUser.role = role || supplierUser.role;
            supplierUser.password = password || supplierUser.password;
            supplierUser.companyId = supplier.companyId || supplierUser.companyId;
            supplierUser.ledger = supplier.ledger || supplierUser.ledger;
            supplierUser.businessUnitId =
              supplier.businessUnitId || supplierUser.businessUnitId;
            await supplierUser.save();
          } else if (status === "Create") {
            const newSupplierUser = new User({
              userName: supplier.name,
              userMail: supplier.email,
              password,
              phone: supplier.phone,
              whatsapp: supplier.whatsapp,
              role,
              department: "Supplier",
              companyId: supplier.companyId,
              businessUnitId: supplier.businessUnitId,
              ledger: supplier.ledger,
            });
            const savedSupplierUser = await newSupplierUser.save();
            supplier.userId = savedSupplierUser._id;
            await supplier.save({ validateBeforeSave: false });
          }
        break;

      default:
        break;
    }
  } catch (error) {
    console.log("error.message: ", error);
  }
};

const login = async (req, res) => {
  try {
    const { auth, password } = req.body;
    // console.log(req.body)

    const user = await User.findOne({
      $or: [{ userMail: auth }, { phone: auth }],
    });
    // console.log('user')

    if (!user)
      return res.status(400).json({ error: "Invalid User Credentials" });

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (isPasswordValid) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user._id);
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken",
      );
      const options = {
        httpOnly: true,
        secure: true, // Ensure this is true in a production environment with HTTPS
        sameSite: "none",
        expires: new Date(Date.now() + 60 * 60 * 1000),
      };
      // notifyRole(
      //   "Employee",
      //   "Login Alert",
      //   `User ${user.userName} has logged in.`,
      //   "/",
      // );

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          user: loggedInUser,
          accessToken,
          refreshToken,
          message: "User logged in Successfully",
        });
    } else {
      return res.status(400).json({ error: "Invalid User Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  const token = req.cookies;
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User Logged Out", token });
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select("-password");
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 60 * 60 * 1000),
    };
    res.status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const users = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .populate("site")
      .sort({ userName: 1 })
      .exec();

    if (!users || users.length === 0)
      return res.status(404).json({ error: "Users not found" });
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Oops!! Something went wrong" });
  }
};

const user = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findOne({ _id })
      .select("-password -refreshToken")
      .populate("site")
      .exec();

    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const resetPasswd = async (req, res) => {
  try {
    const { userMail, password } = req.body;
    const existingUser = await User.findOne()
      .where("userMail")
      .equals(userMail)
      .select("-refreshToken")
      .exec();
    if (!existingUser) return res.status(404).json({ error: "User not found" });
    // console.log(existingUser)
    existingUser.password = password;
    await existingUser.save();
    return res.status(201).json({ message: "Password Reset successful!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id)
    const { userName, userMail, phone, role, department, whatsapp, companyId } =
      req.body;
    // console.log(req.body)
    const avatarLocalPath = req.file?.path;
    const upload = await uploadOnCloudinary(avatarLocalPath, {
      folder: "user/avatars",
      public_id: `${userName}-${Date.now()}`,
    });
    console.log(upload);
    const existingUser = await User.findById(id).select("-refreshToken");
    if (avatarLocalPath) {
      existingUser.avatar = {
        secure_url:
          upload?.secure_url || existingUser.avatar?.secure_url || null,
        public_id: upload?.public_id || existingUser.avatar?.public_id || null,
      };
      await existingUser.save();
    }
    existingUser.userName = userName || existingUser.userName;
    existingUser.userMail = userMail || existingUser.userMail;
    existingUser.phone = phone || existingUser.phone;
    existingUser.whatsapp = whatsapp || existingUser.whatsapp;
    // existingUser.password = password || existingUser.password;
    existingUser.role = role || existingUser.role;
    existingUser.department = department || existingUser.department;
    existingUser.companyId = companyId || existingUser.companyId;
    // existingUser.avatar = upload.secure_url || existingUser.avatar;
    await existingUser.save();

    if (!existingUser) return res.status(404).json({ error: "User not found" });
    res
      .status(201)
      .json({ message: "User updated successfully", existingUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-refreshToken").exec();
    if (!user) return res.status(404).json({ error: "User not found" });
    user.status = "Inactive";
    await user.save();
    res.status(201).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Oops!! Something went wrong" });
  }
};

module.exports = {
  createUser,
  login,
  register,
  users,
  user,
  updateUser,
  deleteUser,
  logout,
  resetPasswd,
  convertToUser,
  refresh,
};
