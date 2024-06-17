const Bill = require('../models/bill.models.js');
const PaymentSchedule = require('../models/paymentschedule.models');
const Site = require('../models/site.models');
const mongoose = require('mongoose');
const Contractor = require('../models/contractor.models');
const Supplier = require('../models/supplier.models.js');
const WorkOrder = require('../models/workorder.models.js');
const PurchaseOrder = require('../models/purchaseOrder.models.js');
const {
    sendApproveByAdmin,
    sendApproveByAccountant,
    sendApproveByIncharge,
    sendApproveByQuality,
    sendApproveByContractor,
    sendApproveBySupplier
} = require('./approval.controller.js')

const getBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .where('approvalStatus').equals('Approved')
            .populate('site')
            .populate('contractor')
            .populate('supplier')
            .populate('createdBy')
            .exec();
        if (bills.length === 0) return res.status(404).json({ message: 'No Bill Found' });
        const approvedBills = bills.filter((bill) => bill.approvalStatus !== 'Pending')
        if (approvedBills.length === 0) {
            return res.status(404).json({ message: 'No Bill Found' });
        } else {
            return res.status(201).json(approvedBills);
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

const getDraftBills = async (req, res) => {
    try {
        const id = req.params.id;
        const bills = await Bill.find()
            .where('approvalStatus').equals("Pending")
            .where('createdBy').equals(id)
            .populate('site')
            .populate('contractor')
            .populate('supplier')
            .populate('createdBy')
            .exec();
        // console.log(bills)
        if (bills.length === 0) return res.status(404).json({ message: 'No Bill Found' });
        return res.status(201).json(bills);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

const getBill = async (req, res) => {
    try {
        const id = req.params.id;
        const bill = await Bill.findById(id)
            .populate('site')
            .populate('contractor')
            .populate('supplier')
            .populate('createdBy')
            .exec();
        if (!bill) return res.status(404).json({ message: 'No Bill Found' });
        return res.status(201).json(bill);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

const siteBill = async (req, res) => {
    try {
        const id = req.params.id;
        const bills = await Bill.find()
            .where('approvalStatus').equals('Approved')
            .where('site').equals(id)
            .populate('site')
            .populate('contractor')
            .populate('supplier')
            .populate('createdBy')
            .exec();
        if (!bills.length === 0) return res.status(404).json({ message: 'No Bill Found' });
        const approvedBills = bills.filter((bill) => bill.approvalStatus !== 'Pending')
        if (approvedBills.length === 0) {
            return res.status(404).json({ message: 'No Bill Found' });
        } else {
            return res.status(201).json(approvedBills);
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error', error });
    }
}
// Todo - review and update --> save bill to it's respective site, supplier, contractor 
const createBill = async (req, res) => {
    try {
        // console.log(req.body);
        const user = req.user;
        const {
            site,
            billFor,
            contractor,
            supplier,
            billOf,
            toPay,
        } = req.body;

        let workOrder;
        let purchaseOrder;
        const existingSite = await Site.findById(site);
        switch (billFor) {
            case 'Contractor':
                const existingContractor = await Contractor.findById(contractor);
                const existingWorkorder = await WorkOrder.findOne()
                    .where('site').equals(site)
                    .where('contractor').equals(contractor)
                    .exec();
                workOrder = existingWorkorder.work?.filter((work) => work?.workDetail === billOf)[0];
                // console.log('workOrder', workOrder)
                const newContractorBill = new Bill({
                    site: existingSite._id,
                    billFor,
                    contractor: existingContractor._id,
                    billOf: workOrder,
                    toPay,
                    amount: workOrder.amount,
                    createdBy: user?._id,
                });
                const ContractorBill = await newContractorBill.save();
                sendApproveByAdmin(ContractorBill, 'Bill', user?._id)
                sendApproveByIncharge(ContractorBill, 'Bill', user?._id)
                sendApproveByAccountant(ContractorBill, 'Bill', user?._id)
                sendApproveByQuality(ContractorBill, 'Bill', user?._id)
                // sendApproveByContractor(newContractorBill, 'bill', createdBy)
                // console.log(ContractorBill)
                res.status(201).json({ message: 'Bill for contractor created successfully', ContractorBill });
                break;
            case 'Supplier':
                const existingSupplier = await Supplier.findById(supplier)
                const purchaseorders = await PurchaseOrder.findOne()
                    .where('site').equals(site)
                    .where('supplier').equals(supplier)
                    .populate('site')
                    .populate('supplier')
                    .exec();
                purchaseOrder = purchaseorders.requirement.filter((require) => require.material === billOf)[0];
                const newSupplierBill = new Bill({
                    site: existingSite._id,
                    supplier: existingSupplier._id,
                    billFor,
                    billOf: purchaseOrder,
                    toPay,
                    amount: purchaseOrder.amount,
                    createdBy: user?._id,
                });
                const SupplierBill = await newSupplierBill.save();
                sendApproveByAdmin(SupplierBill, 'Bill', user?._id)
                sendApproveByIncharge(SupplierBill, 'Bill', user?._id)
                sendApproveByAccountant(SupplierBill, 'Bill', user?._id)
                sendApproveByQuality(SupplierBill, 'Bill', user?._id)
                // sendApproveBySupplier(SupplierBill, 'bill', createdBy)
                res.status(201).json({ message: 'Bill for supplier created successfully' });
                break;

            default:
                break;
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

const saveBill = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        // console.log(user)
        const bill = await Bill.findById(id)
            .where('createdBy').equals(user?._id)
            .populate('site')
            .populate('contractor')
            .populate('supplier')
            .populate('createdBy')
            .exec();
        if (!bill) return res.status(404).json({ message: 'No Bill Found' });
        const existingSite = await Site.findById(bill?.site._id);
        const existingContractor = await Contractor.findById(bill?.contractor?._id);
        const existingSupplier = await Supplier.findById(bill?.supplier?._id)
        if (bill.createdBy._id.toString() === user?._id.toString()) {
            if (bill.adminApprove === 'Approved' && bill.accoutantApprove === 'Approved' && bill.inchargeApprove === 'Approved' && bill.qualityApprove === 'Approved') {
                bill.approvalStatus = 'Approved'
                await bill.save();
                switch (bill.billFor) {
                    case 'Contractor':
                        existingSite.bill.push(bill._id);
                        existingContractor.bill.push(bill._id);
                        await existingSite.save();
                        await existingContractor.save();
                        break;
                    case 'Supplier':
                        existingSite.bill.push(bill._id);
                        existingSupplier.bill.push(bill._id);
                        await existingSite.save();
                        await existingSupplier.save();
                        break;
                    default:
                        break;
                }
                console.log('bill:', bill)
                return res.status(201).json({ message: 'Bill Saved Successfuly' })
            } else {
                console.log('Bill is Not Approved By Every One')
                return res.status(400).json({ message: 'Bill is Not Approved By Every One' });
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

const updateBill = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            site,
            billFor,
            contractor,
            supplier,
            createdBy,
            billOf,
            toPay,
            dateOfPayment,
            paymentStatus,
            reason,
            paidAmount,
            dueAmount,
        } = req.bill;
        const user = req.user;
        console.log('req.body', req.body);
        let workOrder;
        let purchaseOrder;
        switch (billFor) {

            case 'Contractor':
                const existingContractorBill = await Bill.findById(id)
                    .where('createdBy').equals(user?._id)
                    .exec();
                const existingWorkorder = await WorkOrder.findOne()
                    .where('site').equals(site)
                    .where('contractor').equals(contractor)
                    .populate('site')
                    .populate('contractor')
                    .exec();
                workOrder = existingWorkorder.work?.filter((work) => work?.workDetail === billOf)[0];
                const workIndex = existingWorkorder?.work.indexOf(workOrder);
                existingContractorBill.site = site || existingContractorBill.site;
                existingContractorBill.billFor = billFor || existingContractorBill.billFor;
                existingContractorBill.contractor = contractor || existingContractorBill.contractor;
                existingContractorBill.createdBy = createdBy || existingContractorBill.createdBy;
                existingContractorBill.billOf = workOrder || existingContractorBill.billOf;
                existingContractorBill.amount = workOrder.amount || existingContractorBill.amount;
                existingContractorBill.toPay = toPay || existingContractorBill.toPay;
                existingContractorBill.dateOfPayment = dateOfPayment || existingContractorBill.dateOfPayment;
                existingContractorBill.paymentStatus = paymentStatus || existingContractorBill.paymentStatus;
                existingContractorBill.reason = reason || existingContractorBill.reason;
                existingContractorBill.paidAmount = paidAmount || existingContractorBill.paidAmount;
                existingWorkorder.work[workIndex].paid = paidAmount
                console.log('existingWorkorder:', existingWorkorder.work[workIndex])
                await existingWorkorder.save();
                await existingContractorBill.save();
                res.status(201).json(existingContractorBill);
                break;

            case 'Supplier':
                const existingSupplierBill = await Bill.findById(id)
                    .where('createdBy').equals(user?._id)
                    .exec();
                const existingSupplier = await Supplier.findById(supplier)
                const existingPurchaseorders = await PurchaseOrder.findOne()
                    .where('site').equals(site)
                    .where('supplier').equals(supplier)
                    .populate('site')
                    .populate('supplier')
                    .exec();
                purchaseOrder = existingPurchaseorders?.requirement.filter((require) => require.material === billOf)[0];
                const materialIndex = existingPurchaseorders?.material.indexOf(purchaseOrder);
                existingSupplierBill.site = site || existingSupplierBill.site,
                    existingSupplierBill.billFor = billFor || existingSupplierBill.billFor,
                    existingSupplierBill.supplier = existingSupplier._id || existingSupplierBill.supplier,
                    // existingSupplierBill.createdBy = createdBy,
                    existingSupplierBill.billOf = purchaseOrder || existingSupplierBill.billOf,
                    existingSupplierBill.toPay = toPay || existingSupplierBill.toPay,
                    existingSupplierBill.dateOfPayment = dateOfPayment || existingSupplierBill.dateOfPayment,
                    existingSupplierBill.paymentStatus = paymentStatus || existingSupplierBill.paymentStatus,
                    existingSupplierBill.reason = reason || existingSupplierBill.reason,
                    existingSupplierBill.paidAmount = paidAmount || existingSupplierBill.paidAmount,
                    existingSupplierBill.dueAmount = dueAmount || existingSupplierBill.dueAmount,
                    existingPurchaseorders.material[materialIndex].paid = paidAmount,
                    await existingPurchaseorders.save();
                await existingSupplierBill.save();
                res.status(201).json(existingSupplierBill);
                break;

            default:
                break;
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

const deleteBill = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        console.log(id);
        const bill = await Bill.findByIdAndDelete(id)
            .where('createdBy').equals(user?._id)
            .exec();
        console.log(bill);
        if (!bill) return res.status(404).json({ message: 'No Bill Found' });
        const existingSite = await Site.findById(bill.site);
        const existingSupplier = await Supplier.findById(bill.supplier)
        const existingContractor = await Contractor.findById(bill.contractor);
        existingSite.bill.splice(id, 1);
        await existingSite.save({ validateBeforeSave: false });
        if (bill.billFor === 'Supplier') {
            existingSupplier.bill.splice(id, 1);
            await existingSupplier.save({ validateBeforeSave: false });
        } else {
            existingContractor.bill.splice(id, 1);
            await existingContractor.save({ validateBeforeSave: false });
        }
        return res.status(201).json({ message: 'Bill Deleted Successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

module.exports = {
    getBill,
    getBills,
    createBill,
    updateBill,
    deleteBill,
    siteBill,
    saveBill,
    getDraftBills,
}