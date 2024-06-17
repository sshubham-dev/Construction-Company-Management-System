const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    task: {
        type: String
    },
    completeBy: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isReminded: Boolean,
    remindAt: Date,
    remindTime: Number,
    remindGap: Number,
},{timestamps: true});


const Todo = new mongoose.model('To-do', todoSchema);
module.exports = Todo;