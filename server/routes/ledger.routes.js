const express = require('express');
const Ledger = express.Router();
const Group = express.Router();
const {
    createLedger,
    createGroup,
    getLedgers,
    getGroups,
    getLedgerById,
    getGroupById,
    updateLedger,
    updateGroup,
    deleteGroup,
    deleteLedger
} = require('../controller/ledger.controller'); // Adjust the path as necessary
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

Ledger.route('/').get(getLedgers).post(createLedger);
Ledger.route('/:id').get(getLedgerById).put(updateLedger).delete(deleteLedger)

Group.route('/').get(getGroups).post(createGroup);
Group.route('/:id').get(getGroupById).put(updateGroup).delete(deleteGroup);

module.exports = { Ledger, Group };