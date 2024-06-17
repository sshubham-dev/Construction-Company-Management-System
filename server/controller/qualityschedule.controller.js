const QualitySchedule = require('../models/qualityschedule.models');
const Site = require('../models/site.models');

const getQualitySchedules = async (req, res) => {
    try {
        const qualityschedules = await QualitySchedule.find()
            .populate('site')
            .exec();
        if (qualityschedules.length === 0) return res.status(404).json({ error: 'No Quality Schedule Found' });
        return res.status(200).json(qualityschedules);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getWorkDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const qualityschedule = await QualitySchedule.findById(id)
        if (!qualityschedule && qualityschedule?.workDetails.length === 0) return res.status(404).json({ error: 'No Quality Schedule & Work Details Found' });
        const workDetail = qualityschedule.workDetails;
        return res.status(200).json(workDetail);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getQualitySchedule = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        const qualityschedule = await QualitySchedule.findById(id)
            .populate('site')
            .exec();
        if (!qualityschedule) return res.status(404).json({ error: 'Quality Schedule not found' });
        return res.status(200).json(qualityschedule);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createQualitySchedule = async (req, res) => {
    try {
        const {
            site,
            qualityScheduleId,
            workDetails,
        } = req.body;
        // console.log(req.body)
        const existingSite = await Site.findById(site);

        const existingQualitySchedule = await QualitySchedule.findOne({
            $and: [{ qualityScheduleId }, { site: existingSite._id }]
        });
        if (existingQualitySchedule) return res.status(500).json({ error: 'Quality Schedule Already exists' });

        const newQualitySchedule = new QualitySchedule({
            site,
            qualityScheduleId,
            workDetails,
        });
        console.log(newQualitySchedule)
        const savedQualitySchedule = await newQualitySchedule.save();
        if (!savedQualitySchedule) return res.status(500).json({ error: 'Something went wrong' });

        existingSite.qualitySchedule = savedQualitySchedule._id;
        await existingSite.save({ validateBeforeSave: false });

        return res.status(200).json({ message: 'Quality Check Schedule created Successfully', savedQualitySchedule });
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateQualitySchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            site,
            qualityScheduleId,
            workDetails: [{
                work,
                checkingDate,
            }]
        } = req.body;
        console.table(req.body)
        console.table(id)

        // Find the existing project schedule
        const existingQualitySchedule = await QualitySchedule.findById(id);
        console.log(existingQualitySchedule)
        if (!existingQualitySchedule) {
            return res.status(404).json({ error: 'Quality Schedule not found' });
        }

        existingQualitySchedule.site = site || existingQualitySchedule.site;
        existingQualitySchedule.qualityScheduleId = qualityScheduleId || existingQualitySchedule.qualityScheduleId;
        const newWorkDetail = {
            work,
            checkingDate,
        };
        if (newWorkDetail) {
            existingQualitySchedule.workDetails.push(newWorkDetail);
        }

        const updatedQualitySchedule = await existingQualitySchedule.save();

        return res.status(200).json({ message: 'Quality Schedule updated successfully', updatedQualitySchedule });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteQualitySchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedProjectSchedule = await QualitySchedule.findByIdAndDelete(id);
        if (!deletedProjectSchedule) return res.status(500).json({ error: 'Something went wrong' });
        return res.status(200).json({ message: 'Project Schedule Deleted Successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateWorkDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const index = req.params.index;
        const {
            work,
            checkingDate,
            checkedAt,
            difference,
            reason,
            status,
        } = req.body;
        console.log('id:', req.params.id);
        console.log('index', req.params.index);
        console.log('req', req.body);

        const qualitySchedule = await QualitySchedule.findById(id);
        if (!qualitySchedule) return res.status(500).json({ error: 'No Project Schedule Found' });
        qualitySchedule.workDetails[index] = {
            work,
            checkingDate,
            checkedAt,
            difference,
            reason,
            status,
        };
        await qualitySchedule.save({ validateBeforeSave: false });
        res.status(201).json({ message: 'Quality Work Detail Updated Successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
// Delete ProjectDetail by Index
const deleteWorkDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const index = req.params.index;
        const qualitySchedule = await QualitySchedule.findById(id);

        if (!qualitySchedule) {
            return res.status(404).json({ error: 'Quality Schedule not found' });
        }

        qualitySchedule.workDetails.splice(index, 1);
        await qualitySchedule.save();
        const qualitySchedules = await QualitySchedule.find()
            .populate('site')
            .exec();
        res.status(201).json({ message: 'Work Detail Deleted Successfully', qualitySchedules, qualitySchedule });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Server Error' });
    }
};



module.exports = {
    getQualitySchedule,
    getQualitySchedules,
    createQualitySchedule,
    updateQualitySchedule,
    deleteQualitySchedule,
    updateWorkDetail,
    deleteWorkDetail,
    getWorkDetails,
};
