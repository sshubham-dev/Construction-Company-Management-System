const express = require('express');
const WorkOrder = express.Router();
const WorkDetail = express.Router();
const {
    getWorkorder,
    getWorkorders,
    createWorkorder,
    updateWorkOrder,
    deleteWorkOrder,
    siteWorkOrder,
    contractorWorkOrder,
    getWorks,
    updateWork,
    deleteWork,
    getBySiteAndContractor,
    getDraftWorkorders,
    saveWorkOrder,
} = require('../controller/workorder.controller');
const { getWorkDetails, createWorkDetails, deleteWorkDetails, deleteDescription, updateDescription, getWorkDetail, updateWorkDetails, workDetailByName } = require('../controller/workDetails.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');

// WorkOrder Routes
WorkOrder.get('/', getWorkorders);
WorkOrder.get('/draft', userAuth, getDraftWorkorders);
WorkOrder.get('/:id', getWorkorder);
WorkOrder.get('/:id/work', getWorks);
WorkOrder.get('/site/:id', siteWorkOrder);
WorkOrder.get('/contractor/:id', contractorWorkOrder);
WorkOrder.get('/:site/:contractor', getBySiteAndContractor);
WorkOrder.post('/create', userAuth, createWorkorder);
WorkOrder.put('/save/:id', userAuth, saveWorkOrder);
WorkOrder.put('/:id', userAuth, updateWorkOrder);
WorkOrder.put('/:id/work/:index', userAuth, updateWork);
WorkOrder.delete('/:id', userAuth, deleteWorkOrder);
WorkOrder.delete('/:id/work/:index', userAuth, deleteWork);

// WorkDetail Routes
WorkDetail.get('/', getWorkDetails);
WorkDetail.get('/:id', getWorkDetail);
WorkDetail.post('/name', workDetailByName);
WorkDetail.post('/create', createWorkDetails);
WorkDetail.put('/:id/:index', updateDescription);
WorkDetail.put('/:id', updateWorkDetails);
WorkDetail.delete('/:id', deleteWorkDetails);
WorkDetail.delete('/:id/:index', deleteDescription);

module.exports = { WorkOrder, WorkDetail };
