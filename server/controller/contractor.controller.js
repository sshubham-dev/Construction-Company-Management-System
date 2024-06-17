const Contractor = require('../models/contractor.models');
const WorkOrder = require('../models/workorder.models');
const Bill = require('../models/bill.models.js');
const Site = require('../models/site.models');
const ExtraWork = require('../models/extrawork.models.js')

const getContractors = async (req, res) => {
    try {
        const contractors = await Contractor.find()
            .populate('site')
            .populate('bill')
            .populate('workOrder')
            .populate('extraWork')
            .exec();
        if (contractors.length === 0) return res.status(404).json({ error: 'Contractors not found' });
        return res.status(200).json(contractors);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const getContractor = async (req, res) => {
    try {
        const id = req.params.id;
        const contractor = await Contractor.findOne(id)
            .populate('site')
            .populate('bill')
            .populate('workOrder')
            .populate('extraWork')
            .exec();
        if (!contractor) return res.status(404).json({ error: 'Contractor not found' });
        return res.status(200).json(contractor);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const createContractor = async (req, res) => {
    try {
        const {
            name,
            contactNo,
            whatsapp,
            address,
            addhar,
            pan,
            bank,
            jobWork,
        } = req.body;

        const newContractor = new Contractor({
            name,
            contactNo,
            whatsapp,
            address,
            addhar,
            pan,
            bank,
            jobWork,
        });

        const existingContractor = await Contractor.findOne({ name });
        if (existingContractor) return res.status(500).json({ error: 'Contractor Already Exists' });

        const savedContractor = await newContractor.save();
        if (!savedContractor) return res.status(500).json({ error: 'Internal Server Error' });

        return res.status(200).json({ message: 'Contractor Created Successfuly', savedContractor });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const updateContractor = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            name,
            contactNo,
            whatsapp,
            address,
            addhar,
            pan,
            bank,
            jobWork,
        } = req.body;
        const updatedContractor = await Contractor.findOneAndUpdate({ _id: id },
            {
                $set: {
                    name,
                    contactNo,
                    whatsapp,
                    address,
                    addhar,
                    pan,
                    bank,
                    jobWork,
                }
            }, { new: true });
        if (!updatedContractor) return res.status(404).json({ error: 'Contractor not found' });

        return res.status(200).json(updatedContractor);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const deleteContractor = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id:", id)
        const deletedContractor = await Contractor.findByIdAndDelete(id);
        if (!deletedContractor) return res.status(404).json({ message: 'Contractor not found' });
        console.log("deletedContractor:", deletedContractor)
        const existingSite = await Site.find();
        const existingWorkOrders = await WorkOrder.find()
            .where('contractor').equals(deletedContractor?._id)
            .exec();
        const existingBills = await Bill.find()
            .where('contractor').equals(deletedContractor?._id)
            .exec();
        const existingExtraWork = await ExtraWork.find()
            .where('contractor').equals(deletedContractor?._id)
            .exec();

        for (const site of existingSite) {
            const index = site.contractor.indexOf(deletedContractor._id);
            if (index !== -1) {
                site.contractor.splice(index, 1);
                await site.save();
                console.log(site.contractor);
            }
        }

        for (const extraWork of existingExtraWork) {
            if (extraWork) {
                extraWork.contractor = null;
                await extraWork.save();
            }
            console.log(extraWork.contractor);
        }

        for (const workOrder of existingWorkOrders) {
            if (workOrder) {
                workOrder.contractor = null;
                await workOrder.save();
            }
            console.log(workOrder.contractor);
        }

        for (const bill of existingBills) {
            if (bill) {
                bill.contractor = null;
                await bill.save();
            }
            console.log(bill.contractor);
        }

        return res.status(200).json({ message: 'Contractor Deleted Successfuly' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

module.exports = { getContractors, getContractor, createContractor, updateContractor, deleteContractor };