// controllers/attendance.controller.js
const { Attendance, Leave } = require("../models/attendance.models");
const User = require("../models/user.models.js");
const { sendApproveByAdmin } = require("./approval.controller.js");
const Employee = require('../models/employee.models');
const { sendNotification } = require("./notification.controller.js");


const getAttendance = async (req, res) => {
  try {
    const user = req.user;
    // console.log(user);
    const attendance = await Attendance.find()
      .where("user.id")
      .equals(user._id)
      .sort({ date: -1 }) // Sort by date in descending order
      .exec();
    if (!attendance)
      return res.status(404).json({ message: "No Attendance Found" });
    return res.status(201).json(attendance);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const getAttendanceByUser = async (req, res) => {
  try {
    const id = req.id;
    const attendance = await Attendance.find()
      .where("user.id")
      .equals(id)
      .sort({ date: -1 }) // Sort by date in descending order
      .exec();
    if (!attendance)
      return res.status(404).json({ message: "No Attendance Found" });
    return res.status(201).json(attendance);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const getAttendances = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .sort({ date: -1 }) // Sort by date in descending order
      .exec();
    if (attendance.length === 0)
      return res.status(404).json({ message: "No Attendance Found" });
    return res.status(201).json(attendance);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const getLeave = async (req, res) => {
  try {
    const user = req.user;
    const leaves = await Leave.find()
      .where("user.id")
      .equals(user._id)
      .sort({ from: -1 }) // Sort by 'from' date in descending order
      .exec();
    if (!leaves) return res.status(404).json({ message: "No Leaves Found" });
    return res.status(201).json(leaves);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const getLeaveByUser = async (req, res) => {
  try {
    const id = req.id;
    const leaves = await Leave.find()
      .where("user.id")
      .equals(id)
      .sort({ from: -1 }) // Sort by 'from' date in descending order
      .exec();
    if (!leaves) return res.status(404).json({ message: "No Leaves Found" });
    return res.status(201).json(leaves);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .sort({ from: -1 }) // Sort by 'from' date in descending order
      .exec();
    if (leaves.length === 0)
      return res.status(404).json({ message: "No Leaves Found" });
    return res.status(201).json(leaves);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const createAttendance = async (req, res) => {
  try {
    const { date, timeIn, status } = req.body;
    const user = req.user;

    const existingUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const existAttendance = await Attendance.findOne()
      .where("user.id")
      .equals(existingUser._id)
      .where("date")
      .equals(date);

    if (existAttendance) {
      return res
        .status(400)
        .json({ message: "Attendance is already marked for this date." });
    }

    const newAttendance = new Attendance({
      user: {
        name: existingUser.userName,
        id: existingUser._id,
      },
      date,
      timeIn,
      status,
    });

    await newAttendance.save();

    existingUser.attendance.push(newAttendance._id);
    const employee = await User.find();
    if (employee.length > 0) {
      for (let emp of employee) {
        sendNotification(emp._id, `${existingUser.userName} is ${status} Today at ${timeIn}`);
      }}
    await existingUser.save({ validateBeforeSave: false });

    return res.status(201).json({ message: "Attendance marked." });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const createLeave = async (req, res) => {
  try {
    const { reason, from, reportingDate } = req.body;
    const user = req.user;

    const existingUser = await User.findById(user._id);
    const newLeave = new Leave({
      user: {
        name: existingUser.userName,
        id: existingUser._id,
      },
      reason,
      from,
      reportingDate,
    });

    const savedLeave = await newLeave.save();

    existingUser.leave.push(savedLeave._id);
    await existingUser.save({ validateBeforeSave: false });
    const employee = await User.find();
    if (employee.length > 0) {
      for (let emp of employee) {
        sendNotification(emp._id, `${existingUser.userName} requested for leave from ${from} to ${reportingDate}`);
      }}
    sendApproveByAdmin(savedLeave, "Leave", user._id);

    return res
      .status(201)
      .json({ message: "Leave created and sent for approval." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const id = req.params.id;
    const existingAttendance = await Attendance.findById(id)
      .populate("user.id")
      .exec();
    if (!existingAttendance)
      return res.status(404).json({ message: "No Attendance Found" });
    return res.status(201).json({ message: "Updated Successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const id = req.params.id;
    const existingLeave = await Leave.findById(id).populate("user.id").exec();
    if (!existingLeave)
      return res.status(404).json({ message: "No Leave Found" });
    return res.status(201).json({ message: "Updated Successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const id = req.params.id;
    const existingAttendance = await Attendance.findByIdAndDelete(id);
    if (!existingAttendance)
      return res.status(404).json({ message: "No Attendance Found" });
    return res.status(201).json({ message: "Deleted Successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const id = req.params.id;
    const existingLeave = await Leave.findByIdAndDelete(id);
    if (!existingLeave)
      return res.status(404).json({ message: "No Leave Found" });
    return res.status(201).json({ message: "Deleted Successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
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
};
