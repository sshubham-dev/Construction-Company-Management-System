const WorkOrder = require('../models/workorder.models');
const Site = require('../models/site.models');
const Contractor = require('../models/contractor.models');
const WorkDetails = require('../models/workDetails.models');
const mongoose = require('mongoose');
const {
    sendApproveByAdmin,
    sendApproveByAccountant,
    sendApproveByIncharge,
    sendApproveByContractor
} = require('./approval.controller.js')

const getWorkorders = async (req, res) => {
    try {
        const workOrders = await WorkOrder.find()
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .populate('site contractor')
            .exec();
        if (workOrders.length === 0) {
            return res.status(404).json({ error: 'No Work-Orders Found' });
        }
        return res.status(200).json(workOrders);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong' });
    }
};

const getDraftWorkorders = async (req, res) => {
    try {
        const user = req.user;
        const workOrders = await WorkOrder.find()
            .where('approvalStatus').equals("Pending")
            .where('createdBy').equals(user?.id)
            .populate('site contractor')
            .exec();
        if (workOrders.length === 0) {
            return res.status(404).json({ error: 'No Work-Orders Found' });
        }
        return res.status(200).json(workOrders);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Something went wrong' });
    }
};

const getWorkorder = async (req, res) => {
    try {
        const id = req.params.id;
        const workOrder = await WorkOrder.findById(id)
            .populate('site')
            .populate('contractor')
            .exec();
        if (!workOrder) {
            return res.status(404).json({ error: 'Work-Order not Found' });
        }
        return res.status(200).json(workOrder);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const siteWorkOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const workOrders = await WorkOrder.find({ site: id })
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .populate('site')
            .populate('contractor')
            .exec();
        if (workOrders.length === 0) {
            return res.status(404).json({ error: 'No Work-Orders Found' });
        }
        return res.status(201).json(workOrders);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}

const getBySiteAndContractor = async (req, res) => {
    try {
        const { contractor, site } = req.params;
        console.log(contractor)
        console.log(site)
        const workOrders = await WorkOrder.find()
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .where('site').equals(site)
            .where('contractor').equals(contractor)
            .populate('site')
            .populate('contractor')
            .exec();
        if (workOrders.length === 0) {
            return res.status(404).json({ error: 'No Work-Orders Found' });
        }
        console.log(workOrders)
        return res.status(201).json(workOrders);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}

const contractorWorkOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const workOrders = await WorkOrder.find({ contractor: id })
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .populate('site')
            .populate('contractor')
            .exec();
        if (workOrders.length === 0) {
            return res.status(404).json({ error: 'No Work-Orders Found' });
        }
        return res.status(201).json(workOrders);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}

const createWorkorder = async (req, res) => {
    try {
        const user = req.user;
        const {
            workOrderName,
            workOrderNo,
            contractor,
            site,
            startdate,
            duration,
            work,
        } = req.body;


        const workName = await WorkDetails.findById(workOrderName);
        if (!workName) {
            return res.status(400).json({ message: 'Work not found' });
        }

        const existingSite = await Site.findById(site);
        if (!existingSite) {
            return res.status(400).json({ message: 'Site not found' });
        }
        // console.log(existingSite)

        const existingContractor = await Contractor.findById(contractor);
        if (!existingContractor) {
            return res.status(400).json({ error: 'Contractor not found' });
        }

        const existingWorkOrder = await WorkOrder.findOne()
            .where('site').equals(site)
            .where('contractor').equals(contractor)
            .exec();
        if (existingWorkOrder) {
            // console.log(existingWorkOrder)
            return res.status(400).json({ message: 'Work-Order already exists for this site' });
        } else {

            const newWorkOrder = new WorkOrder({
                workOrderName: workName.title,
                workOrderNo,
                createdBy: user?._id,
                contractor: existingContractor._id,
                site: existingSite._id,
                work,
                startdate,
                duration,
            });

            const savedWorkOrder = await newWorkOrder.save();
            sendApproveByAdmin(savedWorkOrder, "Work Order", user._id)

            res.status(201).json({ message: 'Work Order Created Successfully' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const saveWorkOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const workOrder = await WorkOrder.findById(id)
            .where('createdBy').equals(user?._id)
            .populate('site contractor')
            .exec();
        // console.log(workOrder)
        if (!workOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        if (workOrder.adminApprove === 'Approved') {
            workOrder.approvalStatus = 'Approved'
            await workOrder.save();
            const existingSite = await Site.findById(workOrder?.site._id);
            const existingContractor = await Contractor.findById(workOrder?.contractor._id);
            if (!existingSite.workOrder.includes(workOrder._id)) {
                existingSite.workOrder.push(workOrder._id);
                existingSite.contractor.push(existingContractor._id);
                await existingSite.save({ validateBeforeSave: false });
            };

            if (!existingContractor.workOrder.includes(workOrder._id)) {
                existingContractor.workOrder.push(workOrder._id);
                existingContractor.site.push(existingSite._id);
                await existingContractor.save({ validateBeforeSave: false });
            }

            return res.status(200).json({ message: 'Purchase Order Saved Successfully' });
        } else {
            return res.status(501).json({ message: 'Purchase Order is not approved' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const updateWorkOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const {
            workOrderName,
            workOrderNo,
            contractor,
            site,
            startdate,
            duration,
            work: [
                {
                    workDetail,
                    rate,
                    area,
                    unit,
                    amount,
                },
            ],
        } = req.body;
        const existingWorkOrder = await WorkOrder.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!existingWorkOrder) {
            return res.status(404).json({ error: 'Work Order not found' });
        }

        const workName = await WorkDetails.findOne({ _id: workOrderName });
        if (!workName) {
            return res.status(400).json({ error: 'Work not found' });
        }

        existingWorkOrder.site = site || existingWorkOrder.site
        existingWorkOrder.contractor = contractor || existingWorkOrder.contractor
        existingWorkOrder.workOrderNo = workOrderNo || existingWorkOrder.workOrderNo
        existingWorkOrder.workOrderName = workName.title || existingWorkOrder.workOrderName
        existingWorkOrder.startdate = startdate || existingWorkOrder.startdate
        existingWorkOrder.duration = duration || existingWorkOrder.duration

        const newWorkDetail = {
            _id: new mongoose.Types.ObjectId(),
            workDetail,
            rate,
            area,
            unit,
            amount,
        };
        if (newWorkDetail) {
            existingWorkOrder.work.push(newWorkDetail);
        }
        await existingWorkOrder.save();
        return res.status(201).json({ message: 'Work Order Updated Successfully' });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const deleteWorkOrder = async (req, res) => {
    try {
        const id = req.params.id;
        // console.log('id', id)
        const user = req.user;
        const workOrder = await WorkOrder.findByIdAndDelete(id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!workOrder) return res.status(500).json({ error: 'Something went wrong' });
        const existingSite = await Site.findById({ _id: workOrder.site });
        if (!existingSite) {
            return res.status(400).json({ error: 'Site not found' });
        }
        const existingContractor = await Contractor.findOne({ _id: workOrder.contractor });
        if (!existingContractor) {
            return res.status(400).json({ error: 'Contractor not found' });
        }
        existingSite.workOrder.splice(workOrder._id, 1);
        existingSite.contractor.splice(existingContractor._id, 1);
        await existingSite.save({ validateBeforeSave: false });
        existingContractor.workOrder.splice(workOrder._id, 1);
        existingContractor.site.splice(existingSite._id, 1);
        await existingContractor.save({ validateBeforeSave: false });
        return res.status(200).json({ message: 'Work Order Deleted Successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const getWorks = async (req, res) => {
    try {
        const id = req.params.id;
        // console.log(id)
        const workOrder = await WorkOrder.findById(id)
        .populate('site')
        .populate('contractor')
        .exec();
        // console.log(workOrder)
        if (!workOrder && workOrder.work.length === 0) {
            return res.status(404).json({ error: 'No Work Order & Work Details Found' });
        }
        const workDetail = workOrder.work;
        return res.status(200).json({ workDetail, workOrder });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const updateWork = async (req, res) => {
    try {
        const id = req.params.id;
        const index = req.params.index;
        const user = req.user;
        const {
            workDetail,
            rate,
            area,
            amount,
            unit,
            status,
        } = req.body;
        const workOrder = await WorkOrder.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!workOrder) {
            return res.status(404).json({ error: 'Work Order not found' });
        }
        console.log(workOrder.work[index])

        workOrder.work[index] = {
            workDetail,
            rate,
            area,
            amount,
            unit,
            status,
        };

        await workOrder.save({ validateBeforeSave: false });
        res.status(201).json({ message: 'Work Detail Updated Successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const deleteWork = async (req, res) => {
    try {
        const id = req.params.id;
        const index = req.params.index;
        const user = req.user;
        const workOrder = await WorkOrder.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!workOrder) return res.status(500).json({ error: 'Something went wrong' });
        workOrder.work.splice(index, 1);
        await workOrder.save();
        const workDetail = workOrder.work;
        res.status(201).json({ message: 'Work Detail Deleted Successfully', workDetail });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

module.exports = {
    getWorkorder,
    getWorkorders,
    createWorkorder,
    updateWorkOrder,
    deleteWorkOrder,
    siteWorkOrder,
    contractorWorkOrder,
    getBySiteAndContractor,
    getWorks,
    getDraftWorkorders,
    updateWork,
    deleteWork,
    saveWorkOrder,
};