const Return = require('../models/Return');  // Assuming the model is in the models folder

// Create a return
exports.createReturn = async (req, res) => {
    try {
        const newReturn = new Return(req.body);
        await newReturn.save();
        res.status(201).json({ success: true, data: newReturn });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all returns
exports.getReturns = async (req, res) => {
    try {
        const returns = await Return.find().populate('site.id');  // Populating the site ID with actual data
        res.status(200).json({ success: true, data: returns });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get return by ID
exports.getReturnById = async (req, res) => {
    try {
        const returnData = await Return.findById(req.params.id).populate('site.id');
        if (!returnData) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        res.status(200).json({ success: true, data: returnData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update a return
exports.updateReturn = async (req, res) => {
    try {
        const updatedReturn = await Return.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedReturn) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        res.status(200).json({ success: true, data: updatedReturn });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a return
exports.deleteReturn = async (req, res) => {
    try {
        const returnData = await Return.findByIdAndDelete(req.params.id);
        if (!returnData) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        res.status(200).json({ success: true, message: 'Return deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
