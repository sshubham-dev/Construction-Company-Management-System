const mongoose = require('mongoose');

const projectDetailSchema = new mongoose.Schema({
    workDetail: {
        type: String,
    },
    startingStatus: {
        toStart: Date,
        startedAt: Date,
        difference: String,
        reason: String,
    },
    completingStatus: {
        toComplete: Date,
        completedAt: Date,
        difference: String,
        reason: String,
    },
    status: {
        type: String,
        default: 'Pending',
    }
});

const projectScheduleSchema = new mongoose.Schema({
    site: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        }
    },
    date: {
        type: Date,
        default: Date.now,
    },
    scheduleId: {
        type: String,
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
    accountheadApprove: {
        type: String,
        default: 'Pending'
    },
    inchargeApprove: {
        type: String,
        default: 'Pending'
    },
    approvalStatus:{
        type:String,
        default: 'Pending'
    }
}, { timestamps: true });

const ProjectSchedule = mongoose.model('Project_Schedule', projectScheduleSchema);

module.exports = ProjectSchedule;
