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
} = require('../controller/projectschedule.controller');


ProjectSchedule.route('/:id')
    .get(getProjectSchedule)
    .put(updateProjectSchedule)
    .delete(deleteProjectSchedule);
ProjectSchedule.get('/', getProjectSchedules);
ProjectSchedule.post('/create', createProjectSchedule);

// ProjectSchedule.put('/updateDetail/:projectId', updateProjectDetail);
// ProjectSchedule.delete('/removeDetail/:projectId', deleteProjectDetail);

ProjectSchedule.get('/:id/projectDetails', getProjectDetails);
ProjectSchedule.put('/:id/projectDetails/:index', updateProjectDetail);
ProjectSchedule.delete('/:id/projectDetails/:index', deleteProjectDetail);


module.exports = ProjectSchedule;