const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    data: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
}, { timestamps: true });

const deleteSchema = new mongoose.Schema({
    data: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reason: {
        type: String,
    },
}, { timestamps: true });

const Draft = mongoose.model('Draft-Items', draftSchema);
const Deleted = mongoose.model('Deleted-Items', deleteSchema);

module.exports = {
    Draft,
    Deleted
}