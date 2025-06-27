const Checklist = require('../models/checklist.models');
const {
    sendApproveByAdmin,
    sendApproveByIncharge,
} = require('./approval.controller.js');
const Site = require('../models/site.models');
const User = require('../models/user.models');

// Create a new checklist
const createChecklist = async (req, res) => {
    try {
        const user = req.user;
        const {
            site,
            date,
            checklistId,
            checkFor,
            name,
            checkWork,
            rating,
            observation,
        } = req.body;

        const existingSite = await Site.findById(site);
        if (!existingSite) {
            return res.status(400).json({ message: 'Site not found' });
        }

        const newChecklist = new Checklist({
            site: { id: existingSite._id, name: existingSite.name },
            date,
            checklistId,
            checkFor,
            name,
            checkWork,
            rating,
            observation,
            createdBy: user._id,
            supervisor: existingSite.supervisor,
        });

        const savedChecklist = await newChecklist.save();
        existingSite.checklist.push(savedChecklist._id);
        await existingSite.save();
        // sendApproveByAdmin(savedChecklist, 'CheckList', user._id)
        // sendApproveByIncharge(savedChecklist, 'CheckList', user._id)
        const existingUser = await User.findById(user._id).select('-password -refreshToken');
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
            employee.notification.push({
                title: 'Checklist Alert',
                message: `A Check List added for ${savedChecklist.checkFor} on ${existingSite.name} by ${existingUser.userName}`,
                createdAt: savedChecklist.createdAt ? savedChecklist.createdAt : new Date(),
                link: `/checklist/${savedChecklist._id}`,
            })
            await employee.save()
        }
        res.status(201).json(savedChecklist);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const saveChecklist = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        // console.log(user)
        const checklist = await Checklist.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!checklist) return res.status(404).json({ message: 'No checklist Found' });
        const existingSite = await Site.findById(checklist?.site?.id);
        if (checklist.createdBy.toString() === user?._id.toString()) {
            if (checklist.adminApprove === 'Approved' && checklist.inchargeApprove === 'Approved') {
                checklist.approvalStatus = 'Approved'
                await checklist.save();
                existingSite.checklist.push(checklist._id);
                await existingSite.save();
                console.log('checklist:', checklist)
                return res.status(201).json({ message: 'checklist Saved Successfuly' })
            } else {
                console.log('checklist is Not Approved By Every One')
                return res.status(400).json({ message: 'checklist is Not Approved By Every One' });
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

// Get all checklists
const getAllChecklists = async (req, res) => {
    try {
        const checklists = await Checklist.find().populate('createdBy');
        res.status(200).json(checklists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single checklist by ID
const getChecklistById = async (req, res) => {
    try {
        const checklist = await Checklist.findById(req.params.id).populate('createdBy').exec();
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        res.status(200).json(checklist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a checklist by ID
const updateChecklist = async (req, res) => {
    try {
        const {
            site,
            date,
            checklistId,
            checkFor,
            name,
            checkWork,
            rating,
            observation,
        } = req.body;

        const existingSite = await Site.findById(site);
        if (!existingSite) {
            return res.status(400).json({ message: 'Site not found' });
        }
        const checklist = await Checklist.findByIdAndUpdate(req.params.id, {
            $set: {
                site: { id: existingSite._id, name: existingSite.name },
                date,
                checklistId,
                checkFor,
                name,
                checkWork,
                rating,
                observation,
            }
        }, { new: true, runValidators: true });
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        res.status(200).json(checklist);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a checklist by ID
const deleteChecklist = async (req, res) => {
    try {
        const checklist = await Checklist.findByIdAndDelete(req.params.id);
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        res.status(200).json({ message: 'Checklist deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createChecklist, getChecklistById, getAllChecklists, updateChecklist, deleteChecklist }