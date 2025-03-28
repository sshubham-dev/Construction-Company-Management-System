const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

const authenticate = (allowedRoles) => async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json('Unauthorized request');
    // console.log(token)

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

        if (!user) {
            return res.status(401).json('Invalid Access Token');
        }

        if (!allowedRoles.includes(user.department)) {
            console.log('Insufficient permissions')
            return res.status(403).json('Insufficient permissions');
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json('Invalid Access Token');
    }
};

const adminAuth = authenticate(['Ceo', 'Company']);
const clientAuth = authenticate(['Client']);
// const employeeAuth = authenticate(['Employee']);
const userAuth = authenticate(['Company', 'Client', 'Supplier', 'Contractor', 'Accountant', 'Marketing', 'Ceo', 'Site Incharge', 'Site Supervisor', 'Design Head', 'Design Engineer', 'Quality Head', 'Quality Engineer', 'Account Head', 'Store Helper']);

module.exports = {
    adminAuth,
    clientAuth,
    //   employeeAuth,
    userAuth
};
