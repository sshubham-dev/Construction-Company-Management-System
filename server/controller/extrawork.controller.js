const ExtraWork = require('../models/extrawork.models.js');
const Site = require('../models/site.models');
const Contractor = require('../models/contractor.models');
const Client = require('../models/client.models');
const {
    sendApproveByAdmin,
    sendApproveByIncharge,
    sendApproveByContractor,
    sendApproveByAccountHead,
} = require('./approval.controller.js');


const getExtraWorks = async (req, res) => {
    try {
        const extraWork = await ExtraWork.find()
            .populate('site.id')
            .populate('contractor.id')
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
            .populate('site.id')
            .populate('contractor.id')
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
            .where('site.id').equals(id)
            .populate('site.id')
            .populate('contractor.id')
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
        const user = req.user;
        const {
            contractor,
            site,
            extraFor,
            WorkDetail,
        } = req.body;

        const existingSite = await Site.findById(site)
        if (site && WorkDetail && contractor === '') {
            console.log('site:', existingSite)
            const existingClient = await Client.findById(existingSite.client.id)
            const newExtraWork = new ExtraWork({
                site: {
                    name: existingSite.name,
                    id: existingSite._id
                },
                client: {
                    id: existingClient._id,
                    name: existingClient.name
                },
                extraFor,
                WorkDetail,
                createdBy: user._id,
            });
            const clientExtraWork = await newExtraWork.save();
            if (!clientExtraWork) return res.status(401).json({ message: 'Extra Work not created' });

            sendApproveByAdmin(clientExtraWork, 'Extra Work', user._id)
            sendApproveByAccountHead(clientExtraWork, 'Extra Work', user._id)

            res.status(201).json({ message: 'Extra Work Created Successfuly', clientExtraWork });
            next();
        }
        else if (contractor && WorkDetail) {
            const existingContractor = await Contractor.findOne({ _id: contractor })
            const newExtraWork = new ExtraWork({
                site: {
                    name: existingSite.name,
                    id: existingSite._id
                },
                contractor: {
                    id: existingContractor._id,
                    name: existingContractor.name,
                },
                extraFor,
                WorkDetail,
                createdBy: user._id,
            });
            const contractorExtraWork = await newExtraWork.save();
            if (!contractorExtraWork) return res.status(401).json({ message: 'Extra Work not created' });
            console.log(contractorExtraWork)

            sendApproveByAdmin(contractorExtraWork, 'Extra Work', user._id)
            sendApproveByAccountHead(contractorExtraWork, 'Extra Work', user._id)
            res.status(201).json({ message: 'Extra Work Created Successfuly', contractorExtraWork })
        }
        else return res.status(401).json({ message: 'All fields are mandantory' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const saveExtraWork = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        // console.log(user)
        const extraWork = await ExtraWork.findById(id)
        if (!extraWork) return res.status(404).json({ message: 'No extraWork Found' });
        const existingSite = await Site.findById(extraWork?.site?.id);

        if (extraWork.createdBy.toString() === user?._id.toString()) {
            if (extraWork.adminApprove === 'Approved' && extraWork.accountheadApprove === 'Approved') {
                extraWork.approvalStatus = 'Approved'
                await extraWork.save();
                existingSite.extraWork.push(extraWork._id);
                await existingSite.save({ validateBeforeSave: false });

                if (extraWork.extraFor == 'Client') {
                    const existingClient = await Client.findById(extraWork.client?.id);
                    existingClient.extraWork.push(extraWork._id);
                    await existingClient.save({ validateBeforeSave: false });
                } else {
                    const existingContractor = await Contractor.findById(extraWork?.contractor?.id);
                    existingContractor.extraWork.push(extraWork._id);
                    await existingContractor.save({ validateBeforeSave: false });
                }

                console.log('extraWork:', extraWork)
                return res.status(201).json({ message: 'extraWork Saved Successfuly' })
            } else {
                console.log('extraWork is Not Approved By Every One')
                return res.status(400).json({ message: 'extraWork is Not Approved By Every One' });
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

const updateExtraWork = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            contractor,
            site,
            extraFor,
            WorkDetail
        } = req.body;
        const existingSite = await Site.findById(site);
        const existingExtraWork = await ExtraWork.findById(id)
        if (!existingExtraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        const existingClient = await Client.findOne()
            .where('site.id').equals(site)
            .exec();


        if (existingSite) {
            existingExtraWork.site = {
                name: existingSite.name,
                id: existingSite._id
            }
        }
        existingExtraWork.contractor = { id: existingSite?.contractor.id || existingExtraWork.contractor.id, name: existingSite?.contractor.name || existingExtraWork.contractor.name }
        existingExtraWork.extraFor = extraFor || existingExtraWork.extraFor
        existingExtraWork.client = { id: existingSite?.client.id || existingExtraWork.client.id, name: existingSite?.client.name || existingExtraWork?.client.name }

        if (Array.isArray(WorkDetail) && WorkDetail.length > 0) {
            for (const wk of WorkDetail) {

                if (wk.work !== '' && wk.rate !== '' && wk.area !== '' && wk.unit !== '' && wk.amount !== '') {
                    const newWorkDetail = {
                        work: wk.work,
                        rate: wk.rate,
                        area: wk.area,
                        unit: wk.unit,
                        amount: wk.amount,
                    }
                    console.log('Pushing:', newWorkDetail);
                    existingExtraWork.WorkDetail.push(newWorkDetail);
                }
            }
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
        const _id = req.params.id;
        const extraWork = await ExtraWork.findByIdAndDelete(_id);
        if (!extraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        res.status(201).json({ message: 'Extra Work Deleted Successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getWork = async (req, res) => {
    try {
        const id = req.params.id;
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
            status,
            date,
            amount
        } = req.body;
        const extraWork = await ExtraWork.findById(id)
        if (!extraWork) return res.status(401).json({ message: 'No Extra Work Found' });
        extraWork.WorkDetail[index] = {
            work: work || extraWork.WorkDetail[index].work,
            rate: rate || extraWork.WorkDetail[index].rate,
            area: area || extraWork.WorkDetail[index].area,
            unit: unit || extraWork.WorkDetail[index].unit,
            date: date || extraWork.WorkDetail[index].date,
            status: status || extraWork.WorkDetail[index].status,
            amount: amount || extraWork.WorkDetail[index].amount,

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
    saveExtraWork,
}