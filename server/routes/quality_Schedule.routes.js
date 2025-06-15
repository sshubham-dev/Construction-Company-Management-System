const express = require('express');
const QualitySchedule = express.Router();
const {
    getQualitySchedule,
    getQualitySchedules,
    createQualitySchedule,
    updateQualitySchedule,
    deleteQualitySchedule,
    updateWorkDetail,
    deleteWorkDetail,
    getWorkDetails,
    saveQualitySchedule,
    getQualitySchedulesBySite
} = require('../controller/qualityschedule.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

QualitySchedule.route('/:id')
    .get(getQualitySchedule)
    .put(updateQualitySchedule)
    .delete(deleteQualitySchedule);
QualitySchedule.get('/', getQualitySchedules);
QualitySchedule.get('/site/:id', getQualitySchedulesBySite);
QualitySchedule.post('/', userAuth, createQualitySchedule);
QualitySchedule.put('/save/:id', userAuth, saveQualitySchedule);


QualitySchedule.get('/:id/workDetails', getWorkDetails);
QualitySchedule.put('/:id/workDetails/:index', updateWorkDetail);
QualitySchedule.delete('/:id/workDetails/:index', deleteWorkDetail);


module.exports = QualitySchedule;