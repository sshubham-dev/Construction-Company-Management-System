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
    getQualitySchedulesBySite,
    getMonthlyQualitySchedule
} = require('../controller/qualityschedule.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

QualitySchedule.get('/', getQualitySchedules);
QualitySchedule.get('/monthly', userAuth, getMonthlyQualitySchedule);
QualitySchedule.post('/', userAuth, createQualitySchedule);
QualitySchedule.route('/:id')
    .get(getQualitySchedule)
    .put(updateQualitySchedule)
    .delete(userAuth, deleteQualitySchedule);
QualitySchedule.get('/site/:id', getQualitySchedulesBySite);
QualitySchedule.put('/save/:id', userAuth, saveQualitySchedule);


QualitySchedule.get('/:id/workDetails', getWorkDetails);
QualitySchedule.put('/:id/workDetails/:index', userAuth, updateWorkDetail);
QualitySchedule.delete('/:id/workDetails/:index', deleteWorkDetail);


module.exports = QualitySchedule;