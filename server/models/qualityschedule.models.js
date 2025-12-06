const mongoose = require('mongoose');

const workDetailSchema = new mongoose.Schema({
    work: {
        type: String,
    },
    checkingDate: {
        type: Date,
    },
    checkedAt: {
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
    },
});

const qualityScheduleSchema = new mongoose.Schema({
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
    qualityScheduleId: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    workDetails: [workDetailSchema],
    qualityApprove: {
        type: String,
        default: 'Pending'
    },
    inchargeApprove: {
        type: String,
        default: 'Pending'
    },
    approvalStatus: {
        type: String,
        default: 'Pending'
    },
}, { timestamps: true });

const QualitySchedule = mongoose.model('Quality_Schedule', qualityScheduleSchema);

module.exports = QualitySchedule;
