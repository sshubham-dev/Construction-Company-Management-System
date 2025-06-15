const WorkDetails = require('../models/workDetails.models');

const getWorkDetails = async (req, res) => {
    try {
        const workDetails = await WorkDetails.find()
        if (workDetails.length === 0) return res.status(404).json({ error: 'Work details not found' });
        return res.status(200).json(workDetails);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}

const exportWorkDetails = async (req, res) => {
    try {
        const workDetails = await WorkDetails.find()
        if (workDetails.length === 0) return res.status(404).json({ error: 'Work details not found' });
        const exportData = {
            title: workDetails.title,
            description: workDetails.description.work
        }
        return res.status(200).json(exportData);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}

const getWorkDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const workDetail = await WorkDetails.findById(id)
        if (!workDetail) return res.status(404).json({ error: 'No Work detail found' });
        return res.status(200).json(workDetail);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}

const exportWorkDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const workDetail = await WorkDetails.findById(id)
        if (!workDetail) return res.status(404).json({ error: 'No Work detail found' });
        return res.status(200).json(workDetail);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}

const workDetailByName = async (req, res) => {
    try {
        const title = req.body;
        console.log(title)
        const workDetail = await WorkDetails.findOne(title);

        if (!workDetail) {
            return res.status(404).json({ error: 'No Work detail found' });
        }

        return res.status(200).json(workDetail);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const createWorkDetails = async (req, res) => {
    try {
        console.log('Request received:', req.body);
        const { title, description } = req.body;

        const existingWork = await WorkDetails.findOne({ title });
        if (existingWork) {
            return res.status(400).json({ error: 'Work detail with this title already exists' });
        }
        const newWork = new WorkDetails({ title, description });
        const savedWork = await newWork.save();
        if (!savedWork) {
            return res.status(500).json({ error: 'Failed to create work details' });
        }
        console.log(savedWork)
        return res.status(200).json({ message: 'Work created successfully', savedWork });
    } catch (error) {
        console.log('Error creating work details:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateWorkDetails = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('update:', id)
        const { title, description } = req.body;

        const existingWorkDetail = await WorkDetails.findById(id);
        if (!existingWorkDetail) {
            return res.status(404).json({ message: 'No Work detail found' });
        }
        // console.log(description[0])
        existingWorkDetail.title = title || existingWorkDetail.title,
            existingWorkDetail.description.push(description[0]),
            await existingWorkDetail.save();

        return res.status(200).json({ message: 'Work detail updated successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
};

const updateDescription = async (req, res) => {
    try {
        const id = req.params.id;
        const index = req.params.index;
        // console.log('update:', id, index)
        const { description } = req.body;

        const existingWorkDetail = await WorkDetails.findById(id);
        if (!existingWorkDetail) {
            return res.status(404).json({ message: 'No Work detail found' });
        }
        console.log(description)
        existingWorkDetail.description[index] = description[0] || existingWorkDetail.description[index],
            await existingWorkDetail.save();

        return res.status(200).json({ message: 'Work detail updated successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
};

const deleteWorkDetails = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('id', id)
        const deletedWorkDetail = await WorkDetails.findByIdAndDelete(id);
        if (!deletedWorkDetail) return res.status(404).json({ error: 'No Work detail found' });
        console.log('deletedWorkDetail', deletedWorkDetail)
        return res.status(200).json({ message: 'Work detail deleted Successfuly', deletedWorkDetail });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}

const deleteDescription = async (req, res) => {
    try {
        const { id, index } = req.params;
        const deletedWorkDetail = await WorkDetails.findById(id);
        if (!deletedWorkDetail) return res.status(404).json({ error: 'No Work detail found' });
        deletedWorkDetail.description.splice(index, 1)
        await deletedWorkDetail.save();
        const workDetails = await WorkDetails.find();
        return res.status(200).json({ message: 'Work detail deleted Successfuly', workDetails });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' });
    }
}




module.exports = { getWorkDetails, getWorkDetail, createWorkDetails, updateWorkDetails, updateDescription, deleteWorkDetails, deleteDescription, workDetailByName };