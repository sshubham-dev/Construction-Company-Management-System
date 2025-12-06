const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
    name: {
        type: String, // Predefined checklist name
    },
    date: {
        type: Date,
        default: Date.now, // Selected date
    },
    checklistId: {
        type: String,
        trim: true,
    },
    site: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site', // Selected site
        }
    },
    supervisor: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Supervisor (selected)
        }
    },
    checkFor: {
        type: String, // Specify which work the checklist is for
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Person who created the checklist
    },
    checkWork: [{
        work: {
            type: String, // Predefined works
        },
        status: {
            type: String,
            enum: ['N/A', 'Yes', 'No'], // Filled after work completion
        },
        remarks: {
            type: String, // Filled after work completion
        },
    }],
    observation: {
        type: String, // Filled after work completion
    },
    authoritySign: {
        approved: {
            type: Boolean,
            default: false, // Initial approval status
        },
        review: String,
    },
    contractorSign: {
        approved: {
            type: Boolean,
            default: false, // Initial approval status
        },
        review: String,
    },
    clientSign: {
        approved: {
            type: Boolean,
            default: false, // Initial approval status
        },
        review: String,
    },
    rating: [{
        category: String, // category to be rated
        stars: {
            type: Number,
            min: 1,
            max: 5, // Rating stars
        },
        remarks: String, // Remarks on the rating
    }],
    approvalStatus: {
        type: String,
        default: 'Pending',
    }
}, { timestamps: true });


const Checklist = mongoose.model('Checklist', checklistSchema);
module.exports = Checklist;


