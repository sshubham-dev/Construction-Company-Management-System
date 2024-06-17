const express = require('express');
const ExtraWork = express.Router();
const {
    getExtraWork,
    getExtraWorks,
    getWork,
    createExtraWork,
    updateExtraWork,
    updateWork,
    deleteExtraWork,
    deleteWork,
    siteExtraWork,
} = require('../controller/extrawork.controller.js');

ExtraWork.get('/', getExtraWorks);
ExtraWork.get('/:id/work', getWork);
ExtraWork.get('/site/:id', siteExtraWork);
ExtraWork.post('/create', createExtraWork);
ExtraWork.route('/:id')
    .get(getExtraWork)
    .put(updateExtraWork)
    .delete(deleteExtraWork);
ExtraWork.put('/:id/work/:index', updateWork);
ExtraWork.delete('/:id/work/:index', deleteWork);

module.exports = ExtraWork;