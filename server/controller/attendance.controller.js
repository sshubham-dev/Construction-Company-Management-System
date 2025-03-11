// controllers/attendance.controller.js
const { Attendance, Leave } = require('../models/attendance.models');
const User = require('../models/user.models.js');
const {
    sendApproveByAdmin,
} = require('./approval.controller.js');

const getAttendance = async (req, res) => {
    try {
        const user = req.user;
        console.log(user)
        const attendance = await Attendance.find()
            .where('user.id').equals(user._id)
            .exec();
        if (!attendance) return res.status(404).json({ message: 'No Attendance Found' })
        return res.status(201).json(attendance)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const getAttendanceByUser = async (req, res) => {
    try {
        const id = req.id;
        const attendance = await Attendance.find()
            .where('user.id').equals(id)
            .exec();
        if (!attendance) return res.status(404).json({ message: 'No Attendance Found' })
        return res.status(201).json(attendance)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const getAttendances = async (req, res) => {
    try {
        const attendance = await Attendance.find();
        if (attendance.length === 0) return res.status(404).json({ message: 'No Attendance Found' })
        return res.status(201).json(attendance)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const getLeave = async (req, res) => {
    try {
        const user = req.user;
        const leaves = await Leave.find()
            .where('user.id').equals(user._id)
            .exec();
        if (!leaves) return res.status(404).json({ message: 'No Leaves Found' })
        return res.status(201).json(leaves)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const getLeaveByUser = async (req, res) => {
    try {
        const id = req.id;
        const leaves = await Leave.find()
            .where('user.id').equals(id)
            .exec();
        if (!leaves) return res.status(404).json({ message: 'No Leaves Found' })
        return res.status(201).json(leaves)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
        if (leaves.length === 0) return res.status(404).json({ message: 'No Leaves Found' })
        return res.status(201).json(leaves)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const createAttendance = async (req, res) => {
    try {
        const { date, timeIn, status } = req.body;
        const user = req.user; // Ensure this is populated by your authentication middleware
        console.log(date);

        // Fetch the existing user without sensitive information
        const existingUser = await User.findById(user._id)
            .select('-password -refreshToken')
            .exec();

        // Check if attendance already exists for the user on the given date
        const existAttendance = await Attendance.findOne()
            .where('user.id').equals(existingUser._id)
            .where('date').equals(date)
            .exec();

        if (existAttendance) {
            console.log('Attendance is already marked for this date')
            return res.status(400).json({ message: 'Attendance is already marked for this date.' });
        }

        // Create a new attendance record
        const newAttendance = new Attendance({
            user: {
                name: existingUser.userName,
                id: existingUser._id
            },
            date: date,
            timeIn,
            status,
        });

        // Save the new attendance record
        const attendance = await newAttendance.save();

        // Update the existing user's attendance array
        existingUser.attendance.push(attendance._id);
        await existingUser.save({ validateBeforeSave: false });

        return res.status(201).json({ message: 'Attendance marked successfully.' });
    } catch (error) {
        console.error('Error creating attendance:', error); // More specific logging
        return res.status(500).json({ message: 'Internal server error.' }); // Use 500 for internal errors
    }
};

const createLeave = async (req, res) => {
    try {
        const { reason, from, reportingDate } = req.body;
        const user = req.user;
        const newLeave = new Leave({
            user: {
                name: user.userName,
                id: user._id
            },
            reason,
            from,
            reportingDate,
        })
        const existLeave = await newLeave.save();
        sendApproveByAdmin(existLeave, 'Leave', user._id)
        return res.status(201).json({ message: 'Successfuly created and send for approval' })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const updateAttendance = async (req, res) => {
    try {
        const id = req.params.id;
        const existingAttendance = await Attendance.findById(id)
            .populate('user.id')
            .exec();
        if (!existingAttendance) return res.status(404).json({ message: 'No Attendance Found' })
        return res.status(201).json({ message: 'Updated Successfuly' })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const updateLeave = async (req, res) => {
    try {
        const id = req.params.id;
        const existingLeave = await Leave.findById(id)
            .populate('user.id')
            .exec();
        if (!existingLeave) return res.status(404).json({ message: 'No Leave Found' })
        return res.status(201).json({ message: 'Updated Successfuly' })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const deleteAttendance = async (req, res) => {
    try {
        const id = req.params.id;
        const existingAttendance = await Attendance.findByIdAndDelete(id);
        if (!existingAttendance) return res.status(404).json({ message: 'No Attendance Found' })
        return res.status(201).json({ message: 'Deleted Successfuly' })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

const deleteLeave = async (req, res) => {
    try {
        const id = req.params.id;
        const existingLeave = await Leave.findByIdAndDelete(id);
        if (!existingLeave) return res.status(404).json({ message: 'No Leave Found' })
        return res.status(201).json({ message: 'Deleted Successfuly' })
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};

module.exports = {
    getAttendance,
    getAttendances,
    getAttendanceByUser,
    getLeave,
    getLeaves,
    getLeaveByUser,
    createAttendance,
    createLeave,
    updateAttendance,
    updateLeave,
    deleteAttendance,
    deleteLeave,
}