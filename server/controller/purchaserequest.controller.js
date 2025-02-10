const PurchaseRequest = require('../models/PurchaseRequest');

// Create a new purchase request
exports.createPurchaseRequest = async (req, res) => {
    try {
        const newPurchaseRequest = new PurchaseRequest(req.body);
        await newPurchaseRequest.save();
        res.status(201).json({ message: 'Purchase Request created successfully', newPurchaseRequest });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error creating purchase request' });
    }
};

// Get all purchase requests
exports.getAllPurchaseRequests = async (req, res) => {
    try {
        const purchaseRequests = await PurchaseRequest.find().populate('site.id to.id createdBy.id');
        res.status(200).json(purchaseRequests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching purchase requests' });
    }
};

// Get a specific purchase request by ID
exports.getPurchaseRequestById = async (req, res) => {
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
exports.updatePurchaseRequest = async (req, res) => {
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
exports.deletePurchaseRequest = async (req, res) => {
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
