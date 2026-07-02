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
    saveExtraWork,
getExtraBySiteAndContractor
} = require('../controller/extrawork.controller.js');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

ExtraWork.get('/', getExtraWorks);
ExtraWork.get('/site/:id', siteExtraWork);
ExtraWork.post('/', userAuth, createExtraWork);
ExtraWork.put('/save/:id', userAuth, saveExtraWork);
ExtraWork.get('/:site/:contractor', getExtraBySiteAndContractor);
ExtraWork.get('/:id/work', getWork);
ExtraWork.route('/:id')
    .get(getExtraWork)
    .put(updateExtraWork)
    .delete(deleteExtraWork);
ExtraWork.put('/:id/work/:index', updateWork);
ExtraWork.delete('/:id/work/:index', deleteWork);

module.exports = ExtraWork;