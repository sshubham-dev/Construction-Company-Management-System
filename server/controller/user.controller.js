const User = require('../models/user.models');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
// const cloudinary = require('../utils/cloudinary.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');

const register = async (req, res) => {
    try {
        const { userName, userMail, password, phone, whatsapp, newPassword } = req.body;
        const avatarLocalPath = req.file?.path;
        // console.log(req.file?.path)

        if (!(userName, userMail, password)) {
            return res.status(404).json({ error: 'All fields are required' });
        }
        let upload = await uploadOnCloudinary(avatarLocalPath);
        // console.log(upload)
        const isCompany = process.env.COMPANY_EMAIL;
        if (userMail === isCompany) {
            const isCompanyExists = await User.find()
                .where('userMail').equals(userMail)
                .where('department').equals('Company')
                .where('role').equals('Admin')
                .exec();

            if (isCompanyExists.length === 0 && isCompanyExists.length < 1) {
                const createCompany = new User({
                    userName,
                    userMail,
                    password,
                    phone,
                    whatsapp,
                    avatar: upload?.url,
                    role: 'Admin',
                    department: 'Company',
                });
                const savedCompany = await createCompany.save();
                const company = await User.findById(savedCompany._id);
                if (!company) {
                    return res.status(501).json({ error: 'Error creating Company' });
                } else {
                    return res.status(201)
                        .json({ message: 'Registrated Successfuly' });
                }
            } else if (isCompanyExists.length === 1) {
                res.status(500).json({ message: "Company Already Exists" });
            }
        } else {
            const userExist = await User.findOne({ userMail });
            if (userExist) {
                const isPasswordValid = await userExist.isPasswordCorrect(password);
                if (isPasswordValid && newPassword) {
                    userExist.avatar = upload?.url || '';
                    console.log(newPassword)
                    userExist.password = newPassword;
                    await userExist.save({ validateBeforeSave: false });
                    return res.status(201)
                        .json({ message: 'Registration successfully' });
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
};

const createUser = async (req, res) => {
    try {
        const { userName, userMail, password, phone, role, department } = req.body;
        const userExist = await User.findOne({
            $and: [{ userName }, { department }]
        });
        if (userExist) return res.status(400).json({ error: 'Validation Error' });
        const newUser = new User({
            userName,
            userMail,
            password,
            phone,
            role,
            department
        });
        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { auth, password } = req.body;
        // console.log(req.body)

        const user = await User.findOne({
            $or: [{ userMail: auth }, { phone: auth }]
        });
        console.log(user)

        if (!user) return res.status(400).json({ error: 'Invalid User Credentials' });

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (isPasswordValid) {
            const accessToken = generateAccessToken(user)
            const refreshToken = generateRefreshToken(user._id)
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            const loggedInUser = await User.findById(user._id)
                .select("-password -refreshToken");
            const options = {
                httpOnly: true,
                secure: true, // Ensure this is true in a production environment with HTTPS
                sameSite: 'none',
                expires: new Date(Date.now() + 60 * 60 * 1000),
            };
            return res
                .status(200)
                .cookie('accessToken', accessToken, options)
                .cookie('refreshToken', refreshToken, options)
                .json({
                    user: loggedInUser, accessToken, refreshToken,
                    message: 'User logged in Successfully',
                });
        } else {
            return res.status(400).json({ error: 'Invalid User Credentials' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
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
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    };
    const token = req.cookies
    res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json({ message: 'User Logged Out', token });
};

const users = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -refreshToken')
            .populate('site')
            .exec();

        if (!users || users.length === 0) return res.status(404).json({ error: 'Users not found' });
        res.status(200).json(users);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Oops!! Something went wrong" });
    }
};

const user = async (req, res) => {
    try {
        const _id = req.params.id;
        const user = await User.findOne({ _id })
            .select('-password -refreshToken')
            .populate('site')
            .exec();

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const resetPasswd = async (req, res) => {
    try {
        const { userMail, password } = req.body;
        const existingUser = await User.findOne()
            .where('userMail').equals(userMail)
            .select('-refreshToken')
            .exec();
        if (!existingUser) return res.status(404).json({ error: 'User not found' });
        console.log(existingUser)
        existingUser.password = password;
        await existingUser.save();
        return res.status(201).json({ message: 'Password Reset successful!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        // console.log(id)
        const { userName, userMail, phone, role, department, whatsapp } = req.body;
        // console.log(req.body)
        const avatarLocalPath = req.file?.path;
        const upload = await uploadOnCloudinary(avatarLocalPath);
        console.log(upload)
        const existingUser = await User.findById(id).select('-refreshToken');
        if (avatarLocalPath) {
            existingUser.avatar = upload.url || existingUser.avatar;
            await existingUser.save();
        }
        existingUser.userName = userName || existingUser.userName;
        existingUser.userMail = userMail || existingUser.userMail;
        existingUser.phone = phone || existingUser.phone;
        existingUser.whatsapp = whatsapp || existingUser.whatsapp;
        // existingUser.password = password || existingUser.password;
        existingUser.role = role || existingUser.role;
        existingUser.department = department || existingUser.department;
        // existingUser.avatar = upload.secure_url || existingUser.avatar;
        await existingUser.save();

        if (!existingUser) return res.status(404).json({ error: 'User not found' });
        res.status(201).json({ message: 'User updated successfully', existingUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });
        res.status(201).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Oops!! Something went wrong' });
    }
};

module.exports = { createUser, login, register, users, user, updateUser, deleteUser, logout, resetPasswd };
