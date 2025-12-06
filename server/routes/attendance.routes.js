const express = require("express");
const Attendances = express.Router();
const Leaves = express.Router();
const LabourAttendances = express.Router();
const {
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
} = require("../controller/attendance.controller");
const { userAuth, adminAuth } = require("../middlewares/auth.middleware");
const { Attendance } = require("../models/attendance.models");
const {
  getLabourAttendances,
  createLabourAttendance,
  updateLabourAttendance,
  deleteLabourAttendance,
  getLabourAttendance,
} = require("../controller/labourattendance.controller");

Attendances.route("/")
  .get(userAuth, getAttendance)
  .post(userAuth, createAttendance);
LabourAttendances.route("/")
  .get(getLabourAttendances)
  .post(createLabourAttendance);
Leaves.route("/").get(userAuth, getLeave).post(userAuth, createLeave);

Attendances.get("/report", getAttendances);

Attendances.route("/:id")
  .put(userAuth, updateAttendance)
  .get(userAuth, getAttendanceByUser)
  .delete(userAuth, deleteAttendance);

Leaves.get("/report", getLeaves);

Leaves.route("/:id")
  .get(userAuth, getLeaveByUser)
  .put(userAuth, updateLeave)
  .delete(userAuth, deleteLeave);

Attendances.get("/export-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const attendance = await Attendance.find()
      .where("user.id")
      .equals(id)
      .exec();
    if (!attendance)
      return res.status(404).json({ message: "No Attendance Found" });
    // Format data for Excel
    const exportData = attendance.map((entry) => ({
      Name: entry.user.name,
      Date: entry.date,
      TimeIn: entry.timeIn,
      Status: entry.status.toUpperCase(),
    }));
    return res.status(201).json(exportData);
  } catch (error) {
    console.log(error);
    return res.status(501).json({ message: error.message });
  }
});

LabourAttendances.route("/:id")
  .get(getLabourAttendance)
  .put(updateLabourAttendance)
  .delete(deleteLabourAttendance);

module.exports = { Attendances, Leaves, LabourAttendances };
