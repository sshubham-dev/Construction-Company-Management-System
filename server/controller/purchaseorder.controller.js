const PurchaseOrder = require('../models/purchaseOrder.models.js'); // Update the path as needed
const Site = require('../models/site.models.js');
const Supplier = require('../models/supplier.models.js');
const mongoose = require('mongoose');
const {
    sendApproveByAdmin,
    sendApproveBySupplier,
    sendApproveByAccountHead
} = require('./approval.controller.js')
const { sendNotification } = require("./notification.controller.js");

// Create a new purchase order
const createPurchaseOrder = async (req, res) => {
    try {
        const user = req.user;
        const {
            supplier,
            site,
            purchaseOrderNo,
            requirement,
        } = req.body;
        const existingSite = await Site.findById(site);
        const existingSupplier = await Supplier.findById(supplier);
        const newPurchaseOrder = new PurchaseOrder({
            supplier: { id: existingSupplier._id, name: existingSupplier.name },
            site: { id: existingSite._id, name: existingSite.name },
            purchaseOrderNo,
            createdBy: user?._id,
            requirement,
        });
        // console.log('first', newPurchaseOrder)
        const savedPurchaseOrder = await newPurchaseOrder.save();
        sendApproveByAdmin(savedPurchaseOrder, 'Purchase Order', user._id)
        sendApproveByAccountHead(savedPurchaseOrder, 'Purchase Order', user._id)
        // sendApproveBySupplier(savedPurchaseOrder, 'Purchase Order', user._id)
        res.status(201).json({ message: 'Purchase Order Created Successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

const savePurchaseOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const purchaseOrder = await PurchaseOrder.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        // console.log(purchaseOrder)
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        if (purchaseOrder.adminApprove === 'Approved' && purchaseOrder.accountheadApprove === 'Approved') {
            purchaseOrder.approvalStatus = 'Approved'
            await purchaseOrder.save();
            const existingSite = await Site.findById(purchaseOrder?.site.id);
            const existingSupplier = await Supplier.findById(purchaseOrder?.supplier.id);
            if (!existingSite.supplier.id.includes(existingSupplier._id)) {
                existingSite.supplier.push({ id: existingSupplier._id, name: existingSupplier.name });
            }
            existingSite.purchaseOrder.push(purchaseOrder._id);
            await existingSite.save();
            if (!existingSupplier?.site?.id.includes(existingSite._id)) {
                existingSupplier?.site?.push({ id: existingSite._id, name: existingSite.name });
            }
            existingSupplier.purchaseOrder.push(purchaseOrder._id);
            await existingSupplier.save();

            return res.status(200).json({ message: 'Purchase Order Saved Successfully' });
        } else {
            return res.status(501).json({ message: 'Purchase Order is not approved' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const draftPurchaseOrders = async (req, res) => {
    try {
        const purchaseOrders = await PurchaseOrder.find()
            .where('approvalStatus').equals("Pending")
            .exec();
        if (!purchaseOrders && purchaseOrders.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.status(200).json(purchaseOrders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

// Get all purchase orders
const getPurchaseOrders = async (req, res) => {
    try {
        const id = req.params.id;
        const purchaseOrders = await PurchaseOrder.find()
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .where('createdBy').equals(id)
            .exec();
        if (!purchaseOrders && purchaseOrders.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        const approvedOrders = purchaseOrders.filter((purchaseOrder) => purchaseOrder.approvalStatus === 'Approved')
        res.status(200).json(approvedOrders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

// Get a specific purchase order by ID
const getPurchaseOrder = async (req, res) => {
    try {
        const _id = req.params.id;
        const purchaseOrder = await PurchaseOrder.findById(_id)
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.status(200).json(purchaseOrder);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const sitePurchaseOrders = async (req, res) => {
    try {
        const id = req.params.id;
        const purchaseOrders = await PurchaseOrder.find()
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .where('site').equals(id)
            .exec();
        if (!purchaseOrders && purchaseOrders.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        const approvedOrders = purchaseOrders.filter((purchaseOrder) => purchaseOrder.approvalStatus === 'Approved')
        res.status(200).json(approvedOrders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const getSiteAndContractorPurchaseOrders = async (req, res) => {
    try {
        const { siteId, supplierId } = req.params;
        const purchaseOrders = await PurchaseOrder.find()
            .where('adminApprove').equals('Approved')
            .where('approvalStatus').equals('Approved')
            .where('site').equals(siteId)
            .where('supplier').equals(supplierId)
            .exec();
        if (!purchaseOrders && purchaseOrders.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        const approvedOrders = purchaseOrders.filter((purchaseOrder) => purchaseOrder.approvalStatus === 'Approved')
        res.status(200).json(approvedOrders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

// Update a purchase order by ID
const updatePurchaseOrder = async (req, res) => {
    try {
        const _id = req.params.id;
        const user = req.user;
        const {
            supplier,
            site,
            purchaseOrderNo,
        } = req.body;
        const existingPurchaseOrder = await PurchaseOrder.findById(_id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!existingPurchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        existingPurchaseOrder.site = site || existingPurchaseOrder.site
        existingPurchaseOrder.supplier = supplier || existingPurchaseOrder.supplier
        existingPurchaseOrder.purchaseOrderNo = purchaseOrderNo || existingPurchaseOrder.purchaseOrderNo
        // existingPurchaseOrder.createdBy = createdBy || existingPurchaseOrder.createdBy
        await existingPurchaseOrder.save();
        res.status(200).json({ message: 'Purchase Order Update Successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a purchase order by ID
const deletePurchaseOrder = async (req, res) => {
    try {
        const _id = req.params.id;
        const user = req.user;
        const deletedPurchaseOrder = await PurchaseOrder.findByIdAndDelete(_id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!deletedPurchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.status(200).json({ message: 'Purchase Order Deleted Successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getRequirements = async (req, res) => {
    try {
        const _id = req.params.id;
        const purchaseOrder = await PurchaseOrder.findById(_id)

        if (!purchaseOrder && purchaseOrder.requirement.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        const requirement = purchaseOrder.requirement;
        return res.status(200).json({ requirement, purchaseOrder });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

const updateRequirement = async (req, res) => {
    try {
        const _id = req.params.id;
        const index = req.params.index;
        const user = req.user;
        const {
            material,
            rate,
            quantity,
            amount,
            unit,
            status,
        } = req.body;
        const purchaseOrder = await PurchaseOrder.findById(_id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        console.log(req.body)
        const Amount = parseFloat(amount)
        purchaseOrder.requirement[index] = {
            material,
            rate,
            quantity,
            amount: Amount,
            unit,
            status,
        };

        await purchaseOrder.save({ validateBeforeSave: false });
        res.status(201).json({ message: 'Requirement Detail Updated Successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

const deleteRequirement = async (req, res) => {
    try {
        const _id = req.params.id;
        const index = req.params.index;
        const user = req.user;
        const purchaseOrder = await PurchaseOrder.findById(_id)
            .where('createdBy').equals(user?._id)
            .exec();
        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        purchaseOrder.requirement.splice(index, 1);
        await purchaseOrder.save();
        const requirement = purchaseOrder.requirement;
        res.status(201).json({ message: 'Work Detail Deleted Successfully', requirement, purchaseOrder });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPurchaseOrder,
    getPurchaseOrders,
    sitePurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getRequirements,
    updateRequirement,
    deleteRequirement,
    getSiteAndContractorPurchaseOrders,
    draftPurchaseOrders,
    savePurchaseOrder
};
