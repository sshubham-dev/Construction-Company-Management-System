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
} = require('../controller/projectschedule.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

ProjectSchedule.get('/', userAuth, getProjectSchedules);
ProjectSchedule.get('/draft', userAuth, getDraftProjectSchedules);
ProjectSchedule.route('/:id')
    .get(getProjectSchedule)
    .put(updateProjectSchedule)
    .delete(deleteProjectSchedule);
ProjectSchedule.post('/', userAuth, createProjectSchedule);
ProjectSchedule.put('/save/:id', userAuth, saveProjectSchedule);
// ProjectSchedule.put('/site/:id', userAuth, );
// ProjectSchedule.put('/updateDetail/:projectId', updateProjectDetail);
// ProjectSchedule.delete('/removeDetail/:projectId', deleteProjectDetail);

ProjectSchedule.get('/:id/projectDetails', getProjectDetails);
ProjectSchedule.put('/:id/projectDetails/:index', updateProjectDetail);
ProjectSchedule.delete('/:id/projectDetails/:index', deleteProjectDetail);


module.exports = ProjectSchedule;