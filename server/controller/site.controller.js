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
const io = require('../utils/socket');

const getSites = async (req, res) => {
    try {
        const sites = await Site.find()
            .populate('client')
            .populate('incharge')
            .populate('supervisor')
            .populate('qualityEngineer')
            .populate('contractor')
            .populate('supplier')
            .populate('bill')
            .populate('purchaseOrder')
            .populate('projectSchedule')
            .populate('paymentSchedule')
            .populate('workOrder')
            .exec();
        if (sites.length === 0) return res.status(404).json({ error: 'Sites Not Found' });
        // setInterval(() => {
        //     io.emit('Sites', `Total ${sites.length} Sites`);
        // }, 4000);
        res.status(200).json(sites);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getSite = async (req, res) => {
    try {
        const id = req.params.id;
        const site = await Site.findById(id)
            .populate('client')
            .populate('incharge')
            .populate('supervisor')
            .populate('qualityEngineer')
            .populate('contractor')
            .populate('supplier')
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
        const user = await User.findById(id);
        if (user && user.department === 'Site Incharge') {
            const inchargeSite = await Site.find()
                .where('incharge').equals(user?._id)
                .populate('client')
                .populate('incharge')
                .populate('supervisor')
                .populate('qualityEngineer')
                .populate('contractor')
                .populate('supplier')
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
                .where('supervisor').equals(user?._id)
                .populate('client')
                .populate('incharge')
                .populate('supervisor')
                .populate('qualityEngineer')
                .populate('contractor')
                .populate('supplier')
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
            const clientSite = await Site.find({ _id: existingClient?.site })
                .populate('client')
                .populate('incharge')
                .populate('supervisor')
                .populate('contractor')
                .populate('qualityEngineer')
                .populate('supplier')
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
            floors,
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
        const site = await Site.findOne({ $and: [{ name }, { client }] });
        if (site) return res.status(500).json({ message: 'Site already exists' });
        const upload = await uploadOnCloudinary(agreementLocalPath);
        // console.log(upload);
        const existingClient = await Client.findById(client);
        const existingIncharge = await User.findById(incharge);
        let existingSupervisor;
        if (supervisor !== '') {
            existingSupervisor = await User.findById(supervisor);
        }
        let existingQuality;
        if (qualityEngineer !== '') {
            existingQuality = await User.findById(qualityEngineer);
        }

        const newSite = new Site({
            name,
            client: existingClient?._id,
            siteId,
            floors,
            area,
            incharge: existingIncharge?._id,
            supervisor: existingSupervisor?._id,
            qualityEngineer: existingQuality?._id,
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

        existingClient.site = savedSite._id;
        await existingClient.save();

        if (supervisor !== '') {
            if (!existingSupervisor?.site.includes(savedSite._id)) {
                existingSupervisor.site.push(savedSite._id);
                await existingSupervisor.save();
            }
        }

        existingIncharge.site.push(savedSite._id);
        await existingIncharge.save();

        if (qualityEngineer !== '') {
            if (!existingQuality?.site.includes(savedSite._id)) {
                existingQuality.site.push(savedSite._id);
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
        const { name, client, siteId, floors, value, area, incharge, supervisor, qualityEngineer, projectType, address } = req.body;
        const agreementLocalPath = req.file?.path;
        console.log('req', req.body);
        const upload = await uploadOnCloudinary(agreementLocalPath);
        // console.log(upload)
        const existingClient = await Client.findById(client);
        const existingIncharge = await User.findById(incharge);
        const existingSupervisor = await User.findById(supervisor);
        const existingQuality = await User.findById(qualityEngineer);
        const existingSite = await Site.findById(id);
        if (!existingSite) return res.status(404).json({ error: 'Site not Found' });
        // find client, incharge, supervisour & update them - todo
        existingSite.name = name || existingSite.name;
        existingSite.siteId = siteId || existingSite.siteId || '';
        existingSite.floors = floors || existingSite.floors;
        existingSite.value = value || existingSite.value;
        existingSite.area = area || existingSite.area;
        existingSite.address = address || existingSite.address;
        existingSite.client = existingClient?._id || existingSite.client;
        existingSite.projectType = projectType || existingSite.projectType;
        existingSite.incharge = existingIncharge?._id || existingSite.incharge;
        existingSite.supervisor = existingSupervisor?._id || existingSite.supervisor;
        existingSite.qualityEngineer = existingQuality?._id || existingSite.qualityEngineer;
        await existingSite.save();

        if (existingClient?.site !== existingSite._id) {
            existingClient.site = existingSite._id;
            await existingClient.save({ validateBeforeSave: false });
        }

        if (!existingSupervisor?.site.includes(existingSite._id)) {
            existingSupervisor?.site.push(existingSite._id);
            await existingSupervisor.save();
        }

        if (!existingIncharge?.site.includes(existingSite._id)) {
            existingIncharge?.site.push(existingSite._id);
            await existingIncharge.save();
        }

        if (!existingQuality?.site.includes(existingSite._id)) {
            existingQuality.site.push(existingSite._id);
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

        const existingClient = await Client.findById(deletedSite.client);
        const existingIncharge = await User.findById(deletedSite.incharge);
        let existingSupervisor;
        if (deletedSite.supervisor !== '') {
            existingSupervisor = await User.findById(deletedSite.supervisor);
        }
        let existingQuality;
        if (deletedSite.qualityEngineer !== '') {
            existingQuality = await User.findById(deletedSite.qualityEngineer);
        }
        const existingContractors = await Contractor.find();
        const existingWorkOrders = await WorkOrder.find()
            .where('site').equals(deleteSite._id)
            .exec();
        const existingBills = await Bill.find()
            .where('site').equals(deleteSite._id)
            .exec();
        const existingPurchaseOrder = await PurchaseOrder.find()
            .where('site').equals(deleteSite._id)
            .exec();
        const existingPaymentSchedule = await PaymentSchedule.findOneAndDelete()
            .where('site').equals(deleteSite._id)
            .exec();
        const existingExtraWork = await ExtraWork.find()
            .where('site').equals(deleteSite._id)
            .exec();
        const existingProjectSchedule = await ProjectSchedule.findOneAndDelete()
            .where('site').equals(deleteSite._id)
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
            const index = contractor.site.indexOf(deletedSite._id);
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