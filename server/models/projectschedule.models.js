const mongoose = require('mongoose');

const projectDetailSchema = new mongoose.Schema({
    workDetail: {
        type: String,
    },
    toStart: {
        type: Date,
    },
    startedAt: {
        type: Date,
    },
    difference: {
        type: String,
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
        default: 'Pending',
    }
});

const projectScheduleSchema = new mongoose.Schema({
    site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    projectScheduleId: {
        type: String,
        unique: true,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    projectDetail: [projectDetailSchema],
    clientApprove: {
        type: String,
        default: 'Pending'
    },
    adminApprove: {
        type: String,
        default: 'Pending'
    },
    inchargeApprove: {
        type: String,
        default: 'Pending'
    },
}, { timestamps: true });

const ProjectSchedule = mongoose.model('Project-Schedule', projectScheduleSchema);

module.exports = ProjectSchedule;
