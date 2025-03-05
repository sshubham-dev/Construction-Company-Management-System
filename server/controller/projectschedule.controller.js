const ProjectSchedule = require('../models/projectschedule.models');
const Site = require('../models/site.models');
const mongoose = require('mongoose')
const {
    sendApproveByAdmin,
    sendApproveByIncharge,
    sendApproveByAccountHead,
} = require('./approval.controller.js');


const getProjectSchedules = async (req, res) => {
    try {
        const projectschedules = await ProjectSchedule.find()

        if (projectschedules.length === 0) return res.status(404).json({ error: 'No Project Schedule Found' });
        return res.status(200).json(projectschedules);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getProjectDetails = async (req, res) => {
    try {
        const _id = req.params.id;
        const projectschedule = await ProjectSchedule.findById(_id);
        if (!projectschedule && projectschedule?.projectDetail.length === 0) return res.status(404).json({ error: 'No Project Schedule & Details Found' });
        const projectDetail = projectschedule.projectDetail;
        return res.status(200).json(projectDetail);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getProjectSchedule = async (req, res) => {
    try {
        const _id = req.params.id;
        const projectschedule = await ProjectSchedule.findById(_id)
        if (!projectschedule) return res.status(404).json({ error: 'Project Schedule not found' });
        return res.status(200).json(projectschedule);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createProjectSchedule = async (req, res) => {
    try {
        const user = req.user;
        const {
            site,
            date,
            projectScheduleId,
            projectDetail,
        } = req.body;

        const existingSite = await Site.findById(site);

        const existingProjectSchedule = await ProjectSchedule.findOne({
            $or: [{ projectScheduleId }, { site: { id: existingSite._id } }]
        });
        if (existingProjectSchedule) return res.status(500).json({ error: 'Project Schedule Already exists' });

        const newProjectSchedule = new ProjectSchedule({
            site: { id: existingSite._id, name: existingSite.name },
            date,
            projectScheduleId,
            projectDetail,
            createdBy:user._id
        });

        const savedProjectSchedule = await newProjectSchedule.save();
        if (!savedProjectSchedule) return res.status(500).json({ error: 'Something went wrong' });
        sendApproveByAdmin(savedProjectSchedule, 'Project Schedule', user._id)
        sendApproveByAccountHead(savedProjectSchedule, 'Project Schedule', user._id)
        sendApproveByIncharge(savedProjectSchedule, 'Project Schedule', user._id)

        return res.status(200).json({ message: 'Project Schedule created Successfully', savedProjectSchedule });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const saveProjectSchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        // console.log(user)
        const projectSchedule = await ProjectSchedule.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!projectSchedule) return res.status(404).json({ message: 'No projectSchedule Found' });
        const existingSite = await Site.findById(projectSchedule?.site?.id);
        if (projectSchedule.createdBy.toString() === user?._id.toString()) {
            if (projectSchedule.adminApprove === 'Approved' && projectSchedule.accountheadApprove === 'Approved' && projectSchedule.inchargeApprove === 'Approved') {
                projectSchedule.approvalStatus = 'Approved'
                await projectSchedule.save();
                existingSite.projectSchedule = projectSchedule._id;
                await existingSite.save({ validateBeforeSave: false });
                console.log('projectSchedule:', projectSchedule)
                return res.status(201).json({ message: 'projectSchedule Saved Successfuly' })
            } else {
                console.log('projectSchedule is Not Approved By Every One')
                return res.status(400).json({ message: 'projectSchedule is Not Approved By Every One' });
            }
        } else {
            console.log('Unauthorized Request')
            return res.status(401).json({ message: 'Unauthorized Request' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

const updateProjectSchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const {
            site,
            date,
            projectScheduleId,
            projectDetail: [{
                workDetail,
                toStart,
            }]
        } = req.body;
        console.table(req.body)
        console.table(id)

        const existingSite = await Site.findById(site);
        // Find the existing project schedule
        let existingProjectSchedule = await ProjectSchedule.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();

        console.log(existingProjectSchedule)
        if (!existingProjectSchedule) {
            return res.status(404).json({ message: 'Project Schedule not found' });
        }

        existingProjectSchedule.site = { id: existingSite._id, name: existingSite.name } || existingProjectSchedule.site;
        existingProjectSchedule.date = date || existingProjectSchedule.date;
        existingProjectSchedule.projectScheduleId = projectScheduleId || existingProjectSchedule.projectScheduleId;
        const newProjectDetail = {
            _id: new mongoose.Types.ObjectId(),
            workDetail,
            toStart,
        };
        if (newProjectDetail) {
            existingProjectSchedule.projectDetail.push(newProjectDetail);
        }

        const updatedProjectSchedule = await existingProjectSchedule.save();

        return res.status(200).json({ message: 'Project Schedule updated successfully', updatedProjectSchedule });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteProjectSchedule = async (req, res) => {
    try {
        const _id = req.params.id;
        const user = req.user;
        const deletedProjectSchedule = await ProjectSchedule.findByIdAndDelete(_id)
            .where('createdBy').equals(user?._id)
            .exec();

        if (!deletedProjectSchedule) return res.status(500).json({ error: 'Something went wrong' });
        return res.status(200).json({ message: 'Project Schedule Deleted Successfully', deletedProjectSchedule });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateProjectDetail = async (req, res) => {
    try {
        const _id = req.params.id;
        const index = req.params.index;
        const user = req.user;
        const {
            workDetail,
            toStart,
            startedAt,
            difference,
            reason,
            status,
        } = req.body;
        console.log('id:', req.params.id);
        console.log('index', req.params.index);
        console.log('req', req.body);

        const projectSchedule = await ProjectSchedule.findById(_id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!projectSchedule) return res.status(500).json({ error: 'No Project Schedule Found' });
        projectSchedule.projectDetail[index] = {
            workDetail,
            toStart,
            startedAt,
            difference,
            reason,
            status,
        };
        await projectSchedule.save({ validateBeforeSave: false });
        res.status(201).json({ message: 'Project Detail Updated Successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Delete ProjectDetail by Index
const deleteProjectDetail = async (req, res) => {
    try {
        const _id = req.params.id;
        const user = req.user;
        const index = req.params.index;
        const projectSchedule = await ProjectSchedule.findById(_id)
            .where('createdBy').equals(user?._id)
            .exec();

        if (!projectSchedule) {
            return res.status(404).json({ error: 'Project Schedule not found' });
        }

        projectSchedule.projectDetail.splice(index, 1);
        await projectSchedule.save();
        const projectSchedules = await ProjectSchedule.find()
        res.status(201).json({ message: 'Project Detail Deleted Successfully', projectSchedules });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Server Error' });
    }
};



module.exports = {
    getProjectSchedule,
    getProjectSchedules,
    getProjectDetails,
    createProjectSchedule,
    updateProjectSchedule,
    deleteProjectSchedule,
    updateProjectDetail,
    deleteProjectDetail,
    saveProjectSchedule,
};
