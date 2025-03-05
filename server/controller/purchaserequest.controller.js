const PurchaseRequest = require('../models/purchaserequest.models');
const {
    sendApproveByAdmin,
    sendApproveByAccountant,
    sendApproveByIncharge,
    sendApproveByAccountHead,
} = require('./approval.controller.js');
const Site = require('../models/site.models');

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
        const purchaseRequests = await PurchaseRequest.find()
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
        const purchaseRequest = await PurchaseRequest.findById(req.params.id).populate('site.id to.id createdBy.id');
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
        const updatedPurchaseRequest = await PurchaseRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPurchaseRequest) {
            return res.status(404).json({ error: 'Purchase request not found' });
        }
        res.status(200).json({ message: 'Purchase request updated successfully', updatedPurchaseRequest });
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

module.exports = { getAllPurchaseRequests, getPurchaseRequestById, createPurchaseRequest, updatePurchaseRequest, deletePurchaseRequest, savePurchaserequest }