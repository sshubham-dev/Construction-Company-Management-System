const express = require('express');
const Attendance = express.Router();
const Leave = express.Router();
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
} = require('../controller/attendance.controller');
const { userAuth, adminAuth } = require('../middlewares/auth.middleware');

Attendance.route('/')
.get(userAuth, getAttendance)
.post(userAuth, createAttendance);

Attendance.get('/report', getAttendances );

Attendance.route('/:id')
.put(userAuth, updateAttendance)
.get(userAuth, getAttendanceByUser)
.delete(userAuth, deleteAttendance);

Leave.route('/')
.get(userAuth, getLeave )
.post(userAuth, createLeave );

Leave.get('/report', getLeaves );

Leave.route('/:id')
.get(userAuth, getLeaveByUser)
.put(userAuth, updateLeave)
.delete(userAuth, deleteLeave);

module.exports = {Attendance, Leave};
