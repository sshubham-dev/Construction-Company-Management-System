const { Attendance, Leave } = require('../models/attendance.models');
const User = require('../models/user.models.js');
const {
    sendApproveByAdmin,
} = require('./approval.controller.js');

const getAttendance = async (req, res) => {
    try {
        const user = req.user;
        const attendance = await Attendance.find()
            .where('userId').equals(user._id)
            .populate('userId')
            .exec();
        if (attendance.length === 0) return res.status(404).json({ message: 'No Attendance Found' })
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
            .where('userId').equals(id)
            .populate('userId')
            .exec();
        if (attendance.length === 0) return res.status(404).json({ message: 'No Attendance Found' })
        return res.status(201).json(attendance)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};
const getAttendances = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate('userId')
            .exec();
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
            .where('userId').equals(user._id)
            .populate('userId')
            .exec();
        if (leaves.length === 0) return res.status(404).json({ message: 'No Leaves Found' })
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
            .where('userId').equals(id)
            .populate('userId')
            .exec();
        if (leaves.length === 0) return res.status(404).json({ message: 'No Leaves Found' })
        return res.status(201).json(leaves)
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};
const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('userId')
            .exec();
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
        const user = req.user;
        // console.log(user)
        // console.log(req.body)
        const existingUser = await User.findById(user._id)
            .select('-password -refreshToken')
            .exec();
        const existAttendance = await Attendance.findOne()
            .where('userId').equals(existingUser._id)
            .where('date').equals(date)
            .exec();
        // console.log(existAttendance)
        if (existAttendance) return res.status(404).json({ message: 'Attendance is already marked' });

        const newAttendance = new Attendance({
            userId: existingUser._id,
            date,
            timeIn,
            status,
        });
        // console.log("newAttendance:", newAttendance)
        const attendance = await newAttendance.save();
        existingUser.attendance.push(attendance._id);
        await existingUser.save({ validateBeforeSave: false });
        return res.status(201).json({ message: 'Attendance Marked Successfuly' });
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};
const createLeave = async (req, res) => {
    try {
        const { reason, from, reportingDate } = req.body;
        const user = req.user;
        const newLeave = new Leave({
            userId: user._id,
            reason,
            from,
            reportingDate,
        })
        const existLeave = await newLeave.save();
        sendApproveByAdmin(existLeave, 'Leave', user._id)
        return res.status(201).json({message: 'Successfuly created and send for approval'})
    } catch (error) {
        console.log(error);
        return res.status(501).json({ message: error.message })
    }
};
const updateAttendance = async (req, res) => {
    try {
        const id = req.params.id;
        const existingAttendance = await Attendance.findById(id)
            .populate('userId')
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
            .populate('userId')
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