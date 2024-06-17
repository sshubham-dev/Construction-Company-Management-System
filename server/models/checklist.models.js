const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
    name: {},
    date: {},
    checklistId: {},
    site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site',
    },
    supervisour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    checkFor: {},
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    checkWork: [{
        description: {},
        checkBySuper: {
            supervisour: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            yes: {},
            no: {},
            na: {},
        },
        yes: {},
        no: {},
        na: {},
        remark: {},
    }],
    observation: [{}],
    authority: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    contractor: {},
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
    },
    rating: {},
}, { timestamps: true });

const CheckList = mongoose.model('Check-List', checklistSchema);
module.exports = CheckList;