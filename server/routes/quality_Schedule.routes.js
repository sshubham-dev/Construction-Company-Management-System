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
} = require('../controller/qualityschedule.controller');


QualitySchedule.route('/:id')
    .get(getQualitySchedule)
    .put(updateQualitySchedule)
    .delete(deleteQualitySchedule);
QualitySchedule.get('/', getQualitySchedules);
QualitySchedule.post('/create', createQualitySchedule);


QualitySchedule.get('/:id/workDetails', getWorkDetails);
QualitySchedule.put('/:id/workDetails/:index', updateWorkDetail);
QualitySchedule.delete('/:id/workDetails/:index', deleteWorkDetail);


module.exports = QualitySchedule;