const express = require('express');
const ProjectSchedule = express.Router();
const {
    getProjectSchedule,
    getProjectSchedules,
    createProjectSchedule,
    updateProjectSchedule,
    deleteProjectSchedule,
    updateProjectDetail,
    deleteProjectDetail,
    getProjectDetails,
    saveProjectSchedule,
    getDraftProjectSchedules,
    getMonthlyProjectSchedule,
} = require('../controller/projectschedule.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

ProjectSchedule.get('/', userAuth, getProjectSchedules);
ProjectSchedule.get('/monthly', userAuth, getMonthlyProjectSchedule);
ProjectSchedule.get('/draft', userAuth, getDraftProjectSchedules);
ProjectSchedule.post('/', userAuth, createProjectSchedule);
ProjectSchedule.put('/save/:id', userAuth, saveProjectSchedule);

ProjectSchedule.route('/:id')
    .get(getProjectSchedule)
    .put(updateProjectSchedule)
    .delete(deleteProjectSchedule);
// ProjectSchedule.put('/site/:id', userAuth, );
// ProjectSchedule.put('/updateDetail/:projectId', updateProjectDetail);
// ProjectSchedule.delete('/removeDetail/:projectId', deleteProjectDetail);

ProjectSchedule.get('/:id/projectDetails', userAuth, getProjectDetails);
ProjectSchedule.put('/:id/projectDetails/:index', userAuth, updateProjectDetail);
ProjectSchedule.delete('/:id/projectDetails/:index', userAuth, deleteProjectDetail);


module.exports = ProjectSchedule;