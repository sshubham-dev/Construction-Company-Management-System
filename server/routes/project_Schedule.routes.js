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
} = require('../controller/projectschedule.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

ProjectSchedule.route('/:id')
    .get(getProjectSchedule)
    .put(updateProjectSchedule)
    .delete(deleteProjectSchedule);
ProjectSchedule.get('/', getProjectSchedules);
ProjectSchedule.post('/', userAuth, createProjectSchedule);
ProjectSchedule.put('/save/:id', userAuth, saveProjectSchedule);
// ProjectSchedule.put('/updateDetail/:projectId', updateProjectDetail);
// ProjectSchedule.delete('/removeDetail/:projectId', deleteProjectDetail);

ProjectSchedule.get('/:id/projectDetails', getProjectDetails);
ProjectSchedule.put('/:id/projectDetails/:index', updateProjectDetail);
ProjectSchedule.delete('/:id/projectDetails/:index', deleteProjectDetail);


module.exports = ProjectSchedule;