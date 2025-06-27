const PurchaseRequest = require('../models/purchaserequest.models');
const {
    sendApproveByAdmin,
    sendApproveByAccountant,
    sendApproveByIncharge,
    sendApproveByAccountHead,
} = require('./approval.controller.js');
const Site = require('../models/site.models');
const User = require('../models/user.models');

// Create a new purchase request
const createPurchaseRequest = async (req, res) => {
    try {
        const user = req.user;
        const {
            site,
            reqDate,
            createdBy,
            requirementFor,
            category,
            requirement,
        } = req.body;
        const existingSite = await Site.findById(site);
        const newPurchaseRequest = new PurchaseRequest({
            site: { id: existingSite._id, name: existingSite.name },
            reqDate,
            createdBy,
            requirementFor,
            category,
            requirement,
            createdBy: user?._id,
        });
        const savedPurchaseRequest = await newPurchaseRequest.save();
        sendApproveByAdmin(savedPurchaseRequest, 'Purchase Request', user._id)
        sendApproveByAccountant(savedPurchaseRequest, 'Purchase Request', user._id)
        sendApproveByAccountHead(savedPurchaseRequest, 'Purchase Request', user._id)
        sendApproveByIncharge(savedPurchaseRequest, 'Purchase Request', user._id)
        const existingUser = await User.findById(user._id).select('-password -refreshToken');
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
            employee.notification.push({
                title: 'Purchase Request Alert',
                message: `Purchase Request created by ${existingUser.userName} for ${savedPurchaseRequest.requirementFor} on ${existingSite.name}`,
                createdAt: savedPurchaseRequest.createdAt ? savedPurchaseRequest.createdAt : new Date(),
                link: `/purchase-request/${savedPurchaseRequest._id}`,
            })
            await employee.save()
        }
        res.status(201).json({ message: 'Purchase Request created successfully', savedPurchaseRequest });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error creating purchase request' });
    }
};

const savePurchaserequest = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        // console.log(user)
        const purchaseRequest = await PurchaseRequest.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!purchaseRequest) return res.status(404).json({ message: 'No purchaseRequest Found' });
        const existingSite = await Site.findById(purchaseRequest?.site?.id);
        if (purchaseRequest.createdBy.toString() === user?._id.toString()) {
            if (purchaseRequest.adminApprove === 'Approved' && purchaseRequest.accountantApprove === 'Approved' && purchaseRequest.accountheadApprove === 'Approved' && purchaseRequest.inchargeApprove === 'Approved') {
                purchaseRequest.approvalStatus = 'Approved'
                await purchaseRequest.save();
                existingSite.purchaseRequest.push(purchaseRequest._id);
                await existingSite.save();
                console.log('purchaseRequest:', purchaseRequest)
                const employees = await User.find({ role: "Employee" });

                for (const employee of employees) {
                    employee.notification.push({
                        title: 'Purchase Request Alert',
                        message: `Purchase Request for ${purchaseRequest.requirementFor} on ${existingSite.name} has been approved by all authorities`,
                        createdAt: purchaseRequest.createdAt ? purchaseRequest.createdAt : new Date(),
                        link: `/purchase-request/${purchaseRequest._id}`,
                    })
                    await employee.save()
                }
                return res.status(201).json({ message: 'purchaseRequest Saved Successfuly' })
            } else {
                console.log('purchaseRequest is Not Approved By Every One')
                return res.status(400).json({ message: 'purchaseRequest is Not Approved By Every One' });
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

// Get all purchase requests
const getAllPurchaseRequests = async (req, res) => {
    try {
        const purchaseRequests = await PurchaseRequest.find().populate('site.id').exec()
        console.log(purchaseRequests)
        res.status(200).json(purchaseRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching purchase requests' });
    }
};

// Get a specific purchase request by ID
const getPurchaseRequestById = async (req, res) => {
    try {
        const purchaseRequest = await PurchaseRequest.findById(req.params.id).populate('site.id').exec()
        if (!purchaseRequest) {
            return res.status(404).json({ error: 'Purchase request not found' });
        }
        res.status(200).json(purchaseRequest);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching purchase request' });
    }
};

// Get a specific purchase request by ID
const getPurchaseRequestBySite = async (req, res) => {
    try {
        const id = req.params.id;
        const purchaseRequest = await PurchaseRequest.find()
            .where('site.id').equals(id)
            .populate('site.id')
            .exec()
        if (!purchaseRequest) {
            return res.status(404).json({ error: 'Purchase request not found' });
        }
        res.status(200).json(purchaseRequest);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching purchase request' });
    }
};

// Update a purchase request
const updatePurchaseRequest = async (req, res) => {
    try {
        const id = req.params.id
        const {
            site,
            reqDate,
            createdBy,
            requirementFor,
            category,
            requirement,
        } = req.body;

        const existingSite = await Site.findById(site);
        const existingPurchaseRequest = await PurchaseRequest.findById(id);
        if (!existingPurchaseRequest) {
            return res.status(404).json({ error: 'Purchase request not found' });
        }

        if (existingSite) {
            existingPurchaseRequest.site = {
                name: existingSite.name,
                id: existingSite._id
            }
        }
        existingPurchaseRequest.reqDate = reqDate || existingPurchaseRequest.reqDate
        existingPurchaseRequest.requirementFor = requirementFor || existingPurchaseRequest.requirementFor
        existingPurchaseRequest.category = category || existingPurchaseRequest.category
        existingPurchaseRequest.createdBy = createdBy || existingPurchaseRequest.createdBy

        if (Array.isArray(requirement) && requirement.length > 0) {
            for (const req of requirement) {

                if (req.item !== '') {
                    const newRequirement = {
                        item: req.item,
                        request: {
                            quantity: req.request.quantity,
                            unit: req.request.unit,
                            remarks: req.request.remarks,
                        },
                        approved: {
                            quantity: req.approved.quantity,
                            unit: req.approved.unit,
                            remarks: req.approved.remarks,
                        },
                    }
                    console.log('Pushing:', newRequirement);
                    existingPurchaseRequest.requirement.push(newRequirement);
                }
            }
        }
        await existingPurchaseRequest.save();
        res.status(200).json({ message: 'Purchase request updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error updating purchase request' });
    }
};

const updatePurchaseRequirement = async (req, res) => {
    try {
        const id = req.params.id
        const index = req.params.index
        const {
            item,
            request,
            approved,
        } = req.body;

        const existingPurchaseRequest = await PurchaseRequest.findById(id);
        if (!existingPurchaseRequest) {
            return res.status(404).json({ error: 'Purchase request not found' });
        }

        if (index < 0 || index >= existingPurchaseRequest.requirement.length) {
            return res.status(400).json({ success: false, message: 'Invalid index' });
        }
        if (!item) {
            return res.status(400).json({ success: false, message: 'Item' });
        }
        existingPurchaseRequest.requirement[index] = {
            item: item || existingPurchaseRequest.requirement[index].item,
            request: {
                quantity: request.quantity || existingPurchaseRequest.requirement.request[index].quantity,
                unit: request.unit || existingPurchaseRequest.requirement.request[index].unit,
                remarks: request.remarks || existingPurchaseRequest.requirement.request[index].remarks
            },
            approved: {
                quantity: approved.quantity || existingPurchaseRequest.requirement.approved[index].quantity,
                unit: approved.unit || existingPurchaseRequest.requirement.approved[index].unit,
                remarks: approved.remarks || existingPurchaseRequest.requirement.approved[index].remarks
            },
        };
        await existingPurchaseRequest.save();
        res.status(200).json(existingPurchaseRequest);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error updating purchase request' });
    }
};

// Delete a purchase request
const deletePurchaseRequest = async (req, res) => {
    try {
        const deletedPurchaseRequest = await PurchaseRequest.findByIdAndDelete(req.params.id);
        if (!deletedPurchaseRequest) {
            return res.status(404).json({ error: 'Purchase request not found' });
        }
        res.status(200).json({ message: 'Purchase request deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting purchase request' });
    }
};

module.exports = { getAllPurchaseRequests, getPurchaseRequestById, getPurchaseRequestBySite, createPurchaseRequest, updatePurchaseRequest, deletePurchaseRequest, savePurchaserequest, updatePurchaseRequirement }