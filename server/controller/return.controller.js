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
const User = require('../models/user.models');

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
        const existingUser = await User.findById(user._id).select('-password -refreshToken');
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
            employee.notification.push({
                title: 'Material Retrun Alert',
                message: `A Material Retrun Requested by ${existingUser.userName} for ${existingSite.name}`,
                createdAt: savedReturn.createdAt ? savedReturn.createdAt : new Date(),
                link: `/sites/return/${savedReturn._id}`,
            })
            await employee.save()
        }
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
        const returns = await Return.find()
            .populate('site.id')
            .exec()  // Populating the site ID with actual data
        res.status(200).json(returns);
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get return by ID
const getReturnById = async (req, res) => {
    try {
        const returnData = await Return.findById(req.params.id)
            .populate('site.id')
            .exec();  // Populating the site ID with actual data
        if (!returnData) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        res.status(200).json(returnData);
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

const getReturnItem = async (req, res) => {
    try {
        const returnData = await Return.findById(req.params.id);
        if (!returnData) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        const data = returnData.returnable;
        res.status(200).json(data);
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update a return
const updateReturn = async (req, res) => {
    try {
        const id = req.params.id;
        const { site, materialType, date, returnable } = req.body;
        const existingSite = await Site.findById(site);
        const existingReturn = await Return.findById(id);
        if (!existingReturn) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        if (existingSite) {
            existingReturn.site = {
                name: existingSite.name,
                id: existingSite._id
            }
        }
        existingReturn.materialType = materialType || existingPurchaseRequest.materialType
        existingReturn.date = date || existingPurchaseRequest.date

        if (Array.isArray(returnable) && returnable.length > 0) {
            for (const retrn of returnable) {

                if (retrn.item !== '') {
                    const newReturnable = {
                        item: retrn.item,
                        quantity: retrn.quantity,
                        unit: retrn.unit,
                    }
                    console.log('Pushing:', newReturnable);
                    existingReturn.returnable.push(newReturnable);
                }
            }
        }
        await existingReturn.save();
        res.status(200).json({ success: true, data: existingReturn });
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateReturnItem = async (req, res) => {
    try {
        const id = req.params.id;
        const index = req.params.index;
        const existingReturnRequest = await Return.findById(id);
        if (!existingReturnRequest) {
            return res.status(404).json({ success: false, message: 'Return not found' });
        }
        if (index < 0 || index >= existingReturnRequest.returnable.length) {
            return res.status(400).json({ success: false, message: 'Invalid index' });
        }
        const { item, quantity, unit, rate, receivedQuantity, remarks } = req.body;
        if (!item || !quantity || !unit) {
            return res.status(400).json({ success: false, message: 'Item, quantity, and unit are required' });
        }
        existingReturnRequest.returnable[index] = {
            item: item || existingReturnRequest.returnable[index].item,
            quantity: quantity || existingReturnRequest.returnable[index].quantity,
            unit: unit || existingReturnRequest.returnable[index].unit,
            rate: rate || existingReturnRequest.returnable[index].rate,
            receivedQuantity: receivedQuantity || existingReturnRequest.returnable[index].receivedQuantity,
            remarks: remarks || existingReturnRequest.returnable[index].remarks
        };
        await existingReturnRequest.save();
        res.status(200).json(existingReturnRequest);

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

module.exports = { createReturn, getReturnById, getReturns, updateReturn, deleteReturn, saveReturn, getReturnItem, updateReturnItem }