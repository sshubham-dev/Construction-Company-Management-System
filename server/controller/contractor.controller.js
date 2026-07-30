const Site = require('../models/site.models');
const Contractor = require('../models/contractor.models');
const { WorkOrder } = require('../models/workorder.models');
const Bill = require('../models/bill.models.js');
const ExtraWork = require('../models/extrawork.models.js');
const { convertToUser } = require('./user.controller.js');
const { addLedger } = require('./ledger.controller.js');
const User = require('../models/user.models.js');
const { sendPushNotification, notifyRole } = require("../utils/pushNotification.js");

const getContractors = async (req, res) => {
    try {
        const contractors = await Contractor.find()
            .populate('bill')
            .populate('workOrder')
            .populate('extraWork')
            .sort({ name: 1 })
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
        const contractor = await Contractor.findById(id)
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
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const {
            name,
            email,
            phone,
            whatsapp,
            address,
            state,
            addhar,
            pan,
            bank,
            jobWork,
            isUser,
            gstNo,
        } = req.body;

        const newContractor = new Contractor({
            name,
            email: email ? email : '', // Ensure email is not undefined
            phone: phone ? phone : '', // Ensure phone is not undefined
            whatsapp,
            address,
            state,
            addhar: addhar ? addhar : '', // Ensure addhar is not undefined
            panNo: pan ? pan : '', // Ensure pan is not undefined
            bank: bank ? bank : '', // Ensure bank is not undefined
            jobWork,
            isUser: isUser ? isUser : false, // Ensure isUser is not undefined
            gstNo: gstNo ? gstNo : '', // Ensure gstNo is not undefined
            companyId: user.companyId
        });

        const existingContractor = await Contractor.findOne({ name });
        if (existingContractor) return res.status(500).json({ error: 'Contractor Already Exists' });

        const savedContractor = await newContractor.save();
        if (!savedContractor) return res.status(500).json({ error: 'Internal Server Error' });
        res.status(200).json({ message: 'Contractor Created Successfuly', savedContractor });
        // const isGSTApplicable = gstNo !== '' ? true : false;
        // addLedger(savedContractor, 'Sundry Creditor', isGSTApplicable, false, 'contractor')
        const existingUser = await User.findById(user._id).select('-password -refreshToken');
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
            employee.notification.push({
                title: 'Contractor Alert',
                message: `A Contractor add by ${existingUser.userName}`,
                createdAt: savedContractor.createdAt ? new Date(savedContractor.createdAt) : new Date()
                // link: `/work-order/${savedWorkOrder._id}`,
            })
            await employee.save()
        }
        if (savedContractor.isUser === true) {
            const password = `${name}@${phone}`;
            await convertToUser(savedContractor._id, 'Contractor', password);
        }

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
            email,
            phone,
            whatsapp,
            address,
            state,
            addhar,
            pan,
            bank,
            jobWork,
            isUser,
            gstNo,
        } = req.body;

        // 🧠 Fetch contractor to trigger pre-save hook
        const contractor = await Contractor.findById(id);
        if (!contractor) return res.status(404).json({ error: 'Contractor not found' });

        // 🛠️ Update fields
        contractor.name = name?.trim() || '';
        contractor.email = email?.trim() || '';
        contractor.phone = phone || '';
        contractor.whatsapp = whatsapp || '';
        contractor.address = address || '';
        contractor.state = state || '';
        contractor.addhar = addhar?.trim() || '';
        contractor.panNo = pan?.trim() || '';
        contractor.bank = bank || '';
        contractor.jobWork = jobWork || '';
        contractor.gstNo = gstNo?.trim() || '';
        contractor.isUser = isUser === true || isUser === 'true';
        contractor.companyId = req.user.companyId || contractor.companyId; // Ensure companyId is set to the user's companyId

        // 💾 Save (triggers ledger sync)
        const updatedContractor = await contractor.save();

        // 🔑 Convert to user if needed
        if (updatedContractor.isUser && !updatedContractor.userId) {
            const password = `${updatedContractor.name}@${updatedContractor.phone}`;
            await convertToUser(updatedContractor._id, 'Contractor', password);
        }

        return res.status(200).json({
            message: 'Contractor updated successfully',
            updatedContractor,
        });
    } catch (error) {
        console.error('Error updating contractor:', error);
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
            .where('contractor.id').equals(deletedContractor?._id)
            .exec();
        const existingBills = await Bill.find()
            .where('contractor.id').equals(deletedContractor?._id)
            .exec();
        const existingExtraWork = await ExtraWork.find()
            .where('contractor.id').equals(deletedContractor?._id)
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