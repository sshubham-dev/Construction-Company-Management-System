const ExtraWork = require('../models/extrawork.models.js');
const Site = require('../models/site.models');
const Contractor = require('../models/contractor.models');
const Client = require('../models/client.models');


const getExtraWorks = async (req, res) => {
    try {
        const extraWork = await ExtraWork.find()
            .populate('site')
            .populate('client')
            .populate('contractor')
            .exec();
        if (extraWork.length === 0) return res.status(401).json({ message: 'No Extra Work Found' });
        res.status(201).json(extraWork);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getExtraWork = async (req, res) => {
    try {
        const id = req.params.id;
        const extraWork = await ExtraWork.findById(id)
            .populate('site')
            .populate('client')
            .populate('contractor')
            .exec();
        if (!extraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        res.status(201).json(extraWork);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const siteExtraWork = async (req, res) => {
    try {
        const id = req.params.id;
        const extraWork = await ExtraWork.find()
        .where('site').equals(id)
            .populate('site')
            .populate('client')
            .populate('contractor')
            .exec();
        if (!extraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        res.status(201).json(extraWork);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createExtraWork = async (req, res, next) => {
    try {
        const {
            contractor,
            site,
            extraFor,
            WorkDetail,
        } = req.body;

        const existingSite = await Site.findById(site)
        if (site && WorkDetail && contractor === '') {
            console.log('site:', existingSite)
            const existingClient = await Client.findById(existingSite.client)
            const newExtraWork = new ExtraWork({
                site: existingSite._id,
                client: existingClient._id,
                extraFor,
                WorkDetail,
            });
            const clientExtraWork = await newExtraWork.save();
            if (!clientExtraWork) return res.status(401).json({ message: 'Extra Work not created' });

            existingSite.extraWork.push(clientExtraWork._id);
            await existingSite.save({ validateBeforeSave: false });

            existingClient.extraWork.push(clientExtraWork._id);
            await existingClient.save({ validateBeforeSave: false });

            res.status(201).json({ message: 'Extra Work Created Successfuly', clientExtraWork });
            next();
        }
        else if (contractor && WorkDetail) {
            const existingContractor = await Contractor.findOne({ _id: contractor })
            const newExtraWork = new ExtraWork({
                site: existingSite._id,
                contractor: existingContractor._id,
                extraFor,
                WorkDetail,
            });
            const contractorExtraWork = await newExtraWork.save();
            if (!contractorExtraWork) return res.status(401).json({ message: 'Extra Work not created' });
            console.log(contractorExtraWork)

            existingContractor.extraWork.push(contractorExtraWork._id);
            await existingContractor.save({ validateBeforeSave: false });

            existingSite.extraWork.push(contractorExtraWork._id);
            await existingSite.save({ validateBeforeSave: false });
            res.status(201).json({ message: 'Extra Work Created Successfuly', contractorExtraWork })
        }
        else return res.status(401).json({ message: 'All fields are mandantory' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateExtraWork = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            contractor,
            site,
            extraFor,
            WorkDetail: {
                work,
                rate,
                area,
                unit,
                amount,
            }
         } = req.body;
        const existingExtraWork = await ExtraWork.findById(id)
        if (!existingExtraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        const existingClient = await Client.findOne({ site });

        existingExtraWork.site = site || existingExtraWork.site
        existingExtraWork.contractor = contractor || existingExtraWork.contractor
        existingExtraWork.extraFor = extraFor || existingExtraWork.extraFor
        existingExtraWork.client = existingClient || existingExtraWork.client
        const newExtraWork = {
            work,
            rate,
            area,
            unit,
            amount,
        }
        if (newExtraWork) {
            // console.log(newExtraWork)
            existingExtraWork.WorkDetail.push(newExtraWork)
        }
        await existingExtraWork.save({ validateBeforeSave: false });
        res.status(201).json({ message: 'Updation Successfully' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteExtraWork = async (req, res) => {
    try {
        const id = req.params.id;
        const extraWork = await ExtraWork.findByIdAndDelete(id);
        if (!extraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        res.status(201).json({ message: 'Extra Work Deleted Successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getWork = async (req, res) => {
    try {
        const { id } = req.params;
        const extraWork = await ExtraWork.findById(id)
        if (!extraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        const workDetails = extraWork.WorkDetail;
        res.status(201).json(workDetails);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateWork = async (req, res) => {
    try {
        const { id, index } = req.params;
        const {
            work,
            rate,
            area,
            unit,
            amount,
            status,
        } = req.body;
        const extraWork = await ExtraWork.findById(id)
        if (!extraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        extraWork.WorkDetail[index] = {
            work,
            rate,
            area,
            unit,
            amount,
            status,
        }
        await extraWork.save();
        res.status(201).json({ message: 'Work Detail Updated Successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteWork = async (req, res) => {
    try {
        const { id, index } = req.params;
        const extraWork = await ExtraWork.findById(id)
        if (!extraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        extraWork.WorkDetail.splice(index, 1);
        await extraWork.save();
        const existingExtraWork = await ExtraWork.find()
            .populate('site')
            .populate('client')
            .populate('contractor')
            .exec();
        res.status(201).json({ message: 'Work deleted Successfully', existingExtraWork, extraWork })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getExtraWork,
    getExtraWorks,
    getWork,
    createExtraWork,
    updateExtraWork,
    updateWork,
    deleteExtraWork,
    deleteWork,
    siteExtraWork,
}