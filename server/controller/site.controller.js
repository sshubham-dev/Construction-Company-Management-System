const Site = require('../models/site.models');
const Client = require('../models/client.models');
const User = require('../models/user.models');
const Contractor = require('../models/contractor.models');
const WorkOrder = require('../models/workorder.models');
const Bill = require('../models/bill.models.js');
const PaymentSchedule = require('../models/paymentschedule.models');
const ProjectSchedule = require('../models/projectschedule.models');
const PurchaseOrder = require('../models/purchaseOrder.models.js');
const ExtraWork = require('../models/extrawork.models.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');

const getSites = async (req, res) => {
    try {
        const sites = await Site.find()
            .populate('bill')
            .populate('purchaseOrder')
            .populate('projectSchedule')
            .populate('paymentSchedule')
            .populate('workOrder')
            .exec();
        if (sites.length === 0) return res.status(404).json({ error: 'Sites Not Found' });
        res.status(200).json(sites);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getSite = async (req, res) => {
    try {
        const id = req.params.id;
        if (id === "") return res.status(500).json({ error: 'Id undefined' });
        const site = await Site.findById(id)
            .populate('bill')
            .populate('purchaseOrder')
            .populate('projectSchedule')
            .populate('paymentSchedule')
            .populate('workOrder')
            .exec();
        if (!site) return res.status(500).json({ error: 'No Site Exists' });
        res.status(200).json(site);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const siteByUser = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('id', id)
        const user = await User.findById(id);
        if (user && user.department === 'Site Incharge') {
            const inchargeSite = await Site.find()
                .where('incharge.id').equals(user?._id)
                .populate('bill')
                .populate('purchaseOrder')
                .populate('projectSchedule')
                .populate('paymentSchedule')
                .populate('workOrder')
                .exec();

            if (inchargeSite.length === 0) return res.status(500).json({ error: 'Sites Not Found' });
            return res.status(201).json(inchargeSite);

        } else if (user.department === 'Site Supervisor') {
            const supervisorSite = await Site.find()
                .where('supervisor.id').equals(user?._id)
                .populate('bill')
                .populate('purchaseOrder')
                .populate('projectSchedule')
                .populate('paymentSchedule')
                .populate('workOrder')
                .exec();
            if (supervisorSite.length === 0) return res.status(500).json({ error: 'Sites Not Found' });
            return res.status(201).json(supervisorSite);

        } else if (user.department === 'Client') {
            const existingClient = await Client.findOne({ userId: user?._id });
            const clientSite = await Site.find({ _id: existingClient?.site.id })
                .populate('bill')
                .populate('purchaseOrder')
                .populate('projectSchedule')
                .populate('paymentSchedule')
                .populate('workOrder')
                .exec();
            if (clientSite.length === 0) return res.status(500).json({ error: 'Sites Not Found' });
            return res.status(201).json(clientSite);
        } else {
            return res.status(500).json({ error: 'No Site Registered For You' });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const createSite = async (req, res) => {
    try {
        const {
            name,
            client,
            siteId,
            // floors,
            area,
            incharge,
            qualityEngineer,
            supervisor,
            projectType,
            address,
        } = req.body;
        // console.log('req.body:', req.body);
        const agreementLocalPath = req.file?.path;
        // console.log(agreementLocalPath)
        const site = await Site.findOne({ $and: [{ name }, { client: { id: client } }] });
        if (site) return res.status(500).json({ message: 'Site already exists' });
        const upload = await uploadOnCloudinary(agreementLocalPath);
        // console.log(upload);
        const existingClient = await Client.findById(client);
        const existingIncharge = await User.findById(incharge);
        let existingSupervisor;
        let existingQuality;
        if (qualityEngineer !== '') {
            existingQuality = await User.findById(qualityEngineer);
        }
        console.log(existingQuality)
        if (supervisor !== '') {
            existingSupervisor = await User.findById(supervisor);
        }

        const newSite = new Site({
            name,
            client: { id: existingClient?._id, name: existingClient.name },
            siteId,
            // floors,
            area,
            incharge: { id: existingIncharge?._id, name: existingIncharge.userName },
            supervisor: existingSupervisor?._id ? { id: existingSupervisor?._id, name: existingSupervisor.userName } : '',
            qualityEngineer: { id: existingQuality?._id, name: existingQuality.userName },
            projectType,
            address,
            agreement: upload?.url || null,
        });

        console.log('Before saving new site:', newSite);
        const savedSite = await newSite.save();
        console.log('After saving new site:', savedSite);
        if (!savedSite) {
            console.log('Site not saved:', savedSite);
            return res.status(500).json({ error: 'Site Not Created' });
        }

        existingClient.site = { id: savedSite._id, name: savedSite.name };
        await existingClient.save();

        if (supervisor !== '') {
            if (existingSupervisor?.site.filter(site => site.id === savedSite._id)) {
                existingSupervisor.site.push({ id: savedSite._id, name: savedSite.name });
                await existingSupervisor.save();
            }
        }

        existingIncharge.site.push({ id: savedSite._id, name: savedSite.name });
        await existingIncharge.save();

        if (qualityEngineer !== '') {
            if (existingQuality?.site.filter(site => site.id === savedSite._id)) {
                existingQuality.site.push({ id: savedSite._id, name: savedSite.name });
                await existingQuality.save();
            }
        }
        res.status(201).json({ message: 'Site Created Successfuly', savedSite });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// review and rewrite
const updateSite = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, client, siteId, value, area, incharge, supervisor, qualityEngineer, projectType, address } = req.body;
        const agreementLocalPath = req.file?.path;
        console.log('req', req.body);
        const upload = await uploadOnCloudinary(agreementLocalPath);
        // console.log(upload)
        const existingClient = await Client.findById(client);
        const existingIncharge = await User.findById(incharge);
        const existingSupervisor = await User.findById(supervisor);
        console.log("Supervisor ID from req.body:", supervisor, existingSupervisor);
        const existingQuality = await User.findById(qualityEngineer);
        const existingSite = await Site.findById(id);
        if (!existingSite) return res.status(404).json({ error: 'Site not Found' });
        // find client, incharge, supervisour & update them - todo
        existingSite.name = name || existingSite.name;
        existingSite.siteId = siteId || existingSite.siteId || '';
        // existingSite.floors = floors || existingSite.floors;
        existingSite.value = value || existingSite.value;
        existingSite.area = area || existingSite.area;
        existingSite.address = address || existingSite.address;
        if (existingClient?._id && existingClient.name) {
            existingSite.client = { id: existingClient._id, name: existingClient.name };
        }

        existingSite.projectType = projectType || existingSite.projectType;
        if (existingIncharge?._id && existingIncharge.userName) {
            existingSite.incharge = { id: existingIncharge._id, name: existingIncharge.userName };
        }

        if (existingSupervisor?._id && existingSupervisor.userName) {
            existingSite.supervisor = {
                id: existingSupervisor._id,
                name: existingSupervisor.userName
            };
        }

        if (existingQuality?._id && existingQuality.userName) {
            existingSite.qualityEngineer = { id: existingQuality._id, name: existingQuality.userName };
        }

        await existingSite.save();

        if (existingClient?.site.id !== existingSite._id) {
            existingClient.site = { id: existingSite._id, name: existingSite.name };
            await existingClient.save({ validateBeforeSave: false });
        }

        if (!existingSupervisor?.site?.some(s => s.id.toString() === existingSite._id.toString())) {
            existingSupervisor?.site.push({ id: existingSite._id, name: existingSite.name });
            await existingSupervisor.save();
        }

        if (!existingIncharge?.site?.some(s => s.id.toString() === existingSite._id.toString())) {
            existingIncharge.site.push({ id: existingSite._id, name: existingSite.name });
            await existingIncharge.save();
        }

        if (!existingQuality?.site?.some(s => s.id.toString() === existingSite._id.toString())) {
            existingQuality.site.push({ id: existingSite._id, name: existingSite.name });
            await existingQuality.save();
        }

        console.log('res', existingSite)
        return res.status(200).json({ message: 'Site Deleted Successfuly' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

const deleteSite = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedSite = await Site.findByIdAndDelete(id);
        if (!deletedSite) return res.status(404).json({ error: 'Site not Found' });
        console.log('deletedSite:', deletedSite)

        const existingClient = await Client.findById(deletedSite.client.id);
        const existingIncharge = await User.findById(deletedSite.incharge.id);
        let existingSupervisor;
        if (deletedSite.supervisor !== '') {
            existingSupervisor = await User.findById(deletedSite.supervisor.id);
        }
        let existingQuality;
        if (deletedSite.qualityEngineer !== '') {
            existingQuality = await User.findById(deletedSite.qualityEngineer.id);
        }
        const existingContractors = await Contractor.find();
        const existingWorkOrders = await WorkOrder.find()
            .where('site.id').equals(deleteSite._id)
            .exec();
        const existingBills = await Bill.find()
            .where('site.id').equals(deleteSite._id)
            .exec();
        const existingPurchaseOrder = await PurchaseOrder.find()
            .where('site.id').equals(deleteSite._id)
            .exec();
        const existingPaymentSchedule = await PaymentSchedule.findOneAndDelete()
            .where('site.id').equals(deleteSite._id)
            .exec();
        const existingExtraWork = await ExtraWork.find()
            .where('site.id').equals(deleteSite._id)
            .exec();
        const existingProjectSchedule = await ProjectSchedule.findOneAndDelete()
            .where('site.id').equals(deleteSite._id)
            .exec();

        // console.log('existingWorkOrders:', existingWorkOrders);

        for (const workOrder of existingWorkOrders) {
            if (workOrder) {
                workOrder.site = null;
                await workOrder.save();
                console.log(workOrder.site);
            }
        }

        for (const bill of existingBills) {
            if (bill) {
                bill.site = null;
                await bill.save();
            }
            console.log(bill.site);
        }
        for (const purchaseOrder of existingPurchaseOrder) {
            if (purchaseOrder) {
                purchaseOrder.site = null;
                await purchaseOrder.save();
            }
            console.log(purchaseOrder.site);
        }

        for (const extraWork of existingExtraWork) {
            if (extraWork) {
                extraWork.site = null;
                await extraWork.save();
            }
            console.log(extraWork.site);
        }

        // console.log('existingContractor:', existingContractors);
        for (const contractor of existingContractors) {
            const index = contractor?.site?.id.indexOf(deletedSite._id);
            if (index !== -1) {
                contractor.site.splice(index, 1);
                await contractor.save();
            }
        }

        existingClient.site = null;
        await existingClient.save({ validateBeforeSave: false });

        if (deletedSite.supervisor !== '') {
            if (existingSupervisor !== '') {
                existingSupervisor?.site.splice(deletedSite._id, 1);
                await existingSupervisor.save();
            }
        }

        existingIncharge?.site.splice(deletedSite._id, 1);
        await existingIncharge.save();

        if (deletedSite.qualityEngineer !== '') {
            if (existingQuality !== '') {
                existingQuality.site.splice(deletedSite._id, 1);
                await existingQuality.save();
            }
        }

        // find the collections related with site & delete this site from them to - todo
        return res.status(200).json({ message: 'Site Deleted Successfuly' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
};


module.exports = { getSites, getSite, createSite, updateSite, deleteSite, siteByUser };