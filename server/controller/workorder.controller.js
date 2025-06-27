const WorkOrder = require('../models/workorder.models');
const Site = require('../models/site.models');
const Contractor = require('../models/contractor.models');
const WorkDetails = require('../models/workDetails.models');
const User = require('../models/user.models.js');
const mongoose = require('mongoose');
const {
    sendApproveByAdmin,
    sendApproveByAccountant,
    sendApproveByAccountHead,
    sendApproveByIncharge,
    sendApproveByContractor
} = require('./approval.controller.js')

const getWorkorders = async (req, res) => {
    try {
        const workOrders = await WorkOrder.find()
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
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
            .where('createdBy').equals(user?._id)
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
        const workOrders = await WorkOrder.find()
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .where('site.id').equals(id)
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
            .where('site.id').equals(site)
            .where('contractor.id').equals(contractor)
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
        const workOrders = await WorkOrder.find()
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .where('contractor.id').equals(id)
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
            .where('site.id').equals(site)
            .where('contractor.id').equals(contractor)
            .exec();
        if (existingWorkOrder) {
            // console.log(existingWorkOrder)
            return res.status(400).json({ message: 'Work-Order already exists for this site' });
        } else {

            const newWorkOrder = new WorkOrder({
                workOrderName,
                workOrderNo,
                createdBy: user?._id,
                contractor: { id: existingContractor._id, name: existingContractor.name },
                site: { id: existingSite._id, name: existingSite.name },
                work,
                startdate,
                duration,
            });

            const savedWorkOrder = await newWorkOrder.save();
            await sendApproveByAdmin(savedWorkOrder, "Work Order", user._id)
            await sendApproveByAccountHead(savedWorkOrder, 'Work Order', user._id)
            await sendApproveByIncharge(savedWorkOrder, 'Work Order', user._id)

            const existingUser = await User.findById(user._id).select('-password -refreshToken');
            const employees = await User.find({ role: "Employee" });

            for (const employee of employees) {
                employee.notification.push({
                    title: 'Work Order Alert',
                    message: `A Work Order created by ${existingUser.userName} for ${savedWorkOrder.workOrderName} of ${existingSite.name}`,
                    createdAt: savedWorkOrder.createdAt ? savedWorkOrder.createdAt : new Date(),
                    link: `/work-order/${savedWorkOrder._id}`,
                })
                await employee.save()
            }
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
            .exec();
        // console.log(workOrder)
        if (!workOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        if (workOrder.adminApprove === 'Approved' && workOrder.accountheadApprove === 'Approved' && workOrder.inchargeApprove == 'Approved') {
            workOrder.approvalStatus = 'Approved'
            await workOrder.save();
            const existingSite = await Site.findById(workOrder?.site.id);
            const existingContractor = await Contractor.findById(workOrder?.contractor.id);
            if (!existingSite.workOrder.includes(workOrder._id)) {
                existingSite.workOrder.push(workOrder._id);
                existingSite.contractor.push({ id: existingContractor._id, name: existingContractor.name });
                await existingSite.save({ validateBeforeSave: false });
            };

            if (!existingContractor.workOrder.includes(workOrder._id)) {
                existingContractor.workOrder.push(workOrder._id);
                existingContractor.site.push({ id: existingSite._id, name: existingSite.name });
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
        const {
            workOrderName,
            workOrderNo,
            contractor,
            site,
            startdate,
            duration,
            work,
        } = req.body;
        console.log('REQ BODY:', JSON.stringify(req.body, null, 2));


        const existingWorkOrder = await WorkOrder.findById(id);
        if (!existingWorkOrder) return res.status(404).json({ error: 'Work Order not found' });

        const existingSite = await Site.findById(site);
        if (!existingSite) return res.status(400).json({ message: 'Site not found' });

        const existingContractor = await Contractor.findById(contractor);
        if (!existingContractor) return res.status(400).json({ error: 'Contractor not found' });

        existingWorkOrder.site = { id: existingSite._id, name: existingSite.name };
        existingWorkOrder.contractor = { id: existingContractor._id, name: existingContractor.name };
        existingWorkOrder.workOrderNo = workOrderNo || existingWorkOrder.workOrderNo;
        existingWorkOrder.workOrderName = workOrderName || existingWorkOrder.workOrderName;
        existingWorkOrder.startdate = startdate || existingWorkOrder.startdate;
        existingWorkOrder.duration = duration || existingWorkOrder.duration;

        if (Array.isArray(work) && work.length > 0) {
            for (const w of work) {
                const parsedRate = parseFloat(w.rate);
                const parsedArea = parseFloat(w.area);
                const calculatedAmount = parsedRate * parsedArea;

                if (
                    typeof w.workDetail === 'string' &&
                    typeof w.unit === 'string' &&
                    !isNaN(parsedRate) &&
                    !isNaN(parsedArea)
                ) {
                    const newWorkDetail = {
                        _id: new mongoose.Types.ObjectId(),
                        workDetail: w.workDetail,
                        rate: parsedRate,
                        area: parsedArea,
                        unit: w.unit,
                        amount: calculatedAmount, // Ensure this is numeric
                    };
                    console.log('Pushing:', newWorkDetail);
                    existingWorkOrder.work.push(newWorkDetail);
                } else {
                    console.log('Invalid work item skipped:', w);
                }
            }
        }

        await existingWorkOrder.save();
        return res.status(201).json({ message: 'Work Order Updated Successfully' });

    } catch (error) {
        console.error(error);
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
        const existingSite = await Site.findById({ _id: workOrder.site.id });
        if (!existingSite) {
            return res.status(400).json({ error: 'Site not found' });
        }
        const existingContractor = await Contractor.findOne({ _id: workOrder.contractor.id });
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