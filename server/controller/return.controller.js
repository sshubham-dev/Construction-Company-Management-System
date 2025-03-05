const Return = require('../models/return.models');  // Assuming the model is in the models folder
const {
    sendApproveByAdmin,
    sendApproveByAccountant,
    sendApproveByIncharge,
    sendApproveByQuality,
    sendApproveByContractor,
    sendApproveByAccountHead,
} = require('./approval.controller.js');
const Site = require('../models/site.models');

// Create a return
const createReturn = async (req, res) => {
    try {
        const user = req.user;
        const {
            site,
            materialType,
            date,
            returnable,
        } = req.body;

        const existingSite = await Site.findById(site);
        if (!existingSite) {
            return res.status(400).json({ message: 'Site not found' });
        }

        const newReturn = new Return({
            site: { id: existingSite._id, name: existingSite.name },
            materialType,
            date,
            returnable,
            createdBy: user._id,
        });
        const savedReturn = await newReturn.save();
        res.status(201).json({ success: true, data: savedReturn });
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

const saveReturn = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        // console.log(user)
        const returnReq = await Return.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!returnReq) return res.status(404).json({ message: 'No returnReq Found' });
        const existingSite = await Site.findById(returnReq?.site?.id);
        if (returnReq.createdBy.toString() === user?._id.toString()) {
            if (returnReq.adminApprove === 'Approved' && returnReq.inchargeApprove === 'Approved') {
                returnReq.approvalStatus = 'Approved'
                await returnReq.save();
                existingSite.returnReq.push(returnReq._id);
                await existingSite.save();
                console.log('returnReq:', returnReq)
                return res.status(201).json({ message: 'returnReq Saved Successfuly' })
            } else {
                console.log('returnReq is Not Approved By Every One')
                return res.status(400).json({ message: 'returnReq is Not Approved By Every One' });
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

// Get all returns
const getReturns = async (req, res) => {
    try {
        const returns = await Return.find();  // Populating the site ID with actual data
        res.status(200).json({ success: true, data: returns });
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get return by ID
const getReturnById = async (req, res) => {
    try {
        const returnData = await Return.findById(req.params.id);
        if (!returnData) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        res.status(200).json({ success: true, data: returnData });
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update a return
const updateReturn = async (req, res) => {
    try {
        const updatedReturn = await Return.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedReturn) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        res.status(200).json({ success: true, data: updatedReturn });
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a return
const deleteReturn = async (req, res) => {
    try {
        const returnData = await Return.findByIdAndDelete(req.params.id);
        if (!returnData) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        res.status(200).json({ success: true, message: 'Return deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { createReturn, getReturnById, getReturns, updateReturn, deleteReturn }