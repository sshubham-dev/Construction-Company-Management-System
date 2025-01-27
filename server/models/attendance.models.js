const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    date: {
        type: Date,
    },
    timeIn: {
        type: String,
    },
    status: {
        type: String,
        default: 'absent'
    }

}, { timestamps: true });

const leaveSchema = new mongoose.Schema({
    user: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    reason: {
        type: String,
    },
    from: {
        type: Date,
        default: Date.now,
    },
    reportingDate: {
        type: Date,
    },
    approval: {
        type: String,
        default: 'Pending'
    },
    reportedAt: {
        type: Date,
    }

}, { timestamps: true });


const Attendance = mongoose.model('Attendance', attendanceSchema);
const Leave = mongoose.model('Leave', leaveSchema);
module.exports = { Attendance, Leave };