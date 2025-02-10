const Checklist = require('../models/Checklist');

// Create a new checklist
exports.createChecklist = async (req, res) => {
    try {
        const checklist = new Checklist(req.body);
        await checklist.save();
        res.status(201).json(checklist);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all checklists
exports.getAllChecklists = async (req, res) => {
    try {
        const checklists = await Checklist.find().populate('site supervisor createdBy');
        res.status(200).json(checklists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single checklist by ID
exports.getChecklistById = async (req, res) => {
    try {
        const checklist = await Checklist.findById(req.params.id).populate('site supervisor createdBy');
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        res.status(200).json(checklist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a checklist by ID
exports.updateChecklist = async (req, res) => {
    try {
        const checklist = await Checklist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!checklist) {
            return res.status(404).json({ message: 'Checklist not found' });
        }
        res.status(200).json(checklist);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a checklist by ID
exports.deleteChecklist = async (req, res) => {
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
