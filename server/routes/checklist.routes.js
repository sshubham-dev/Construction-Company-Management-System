const express = require('express');
const Checklist = express.Router();
const { createChecklist, getChecklistById, getAllChecklists, updateChecklist, deleteChecklist } = require('../controller/checklist.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

Checklist.route('/').get(getAllChecklists).post(userAuth, createChecklist)
Checklist.route('/:id').get(getChecklistById).put(updateChecklist).delete(deleteChecklist)

module.exports = Checklist;