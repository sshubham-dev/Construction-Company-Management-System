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
    sendApproveByAccountHead,
    sendApproveByIncharge,
    sendApproveByQuality,
    sendApproveByContractor,
} = require('./approval.controller.js')

const getBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .where('approvalStatus').equals('Approved')
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
        const bill = await Bill.findById(id);
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
            .where('site.id').equals(id)
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
            contractor,
            billOf,
            toPay,
        } = req.body;

        let workOrder;
        const existingSite = await Site.findById(site);
        const existingContractor = await Contractor.findById(contractor);
        const existingWorkorder = await WorkOrder.findOne()
            .where('site.id').equals(site)
            .where('contractor.id').equals(contractor)
            .exec();
        workOrder = existingWorkorder.work?.filter((work) => work?.workDetail === billOf)[0];
        // console.log('workOrder', workOrder)
        const newContractorBill = new Bill({
            site: {
                name: existingSite.name,
                id: existingSite._id
            },
            contractor: {
                name: existingContractor.name,
                id: existingContractor._id
            },
            billOf: workOrder,
            toPay,
            amount: workOrder.amount,
            createdBy: user?._id,
        });
        const ContractorBill = await newContractorBill.save();
        sendApproveByAdmin(ContractorBill, 'Bill', user?._id)
        sendApproveByIncharge(ContractorBill, 'Bill', user?._id)
        sendApproveByAccountant(ContractorBill, 'Bill', user?._id)
        sendApproveByAccountHead(ContractorBill, 'Bill', user?._id)
        sendApproveByQuality(ContractorBill, 'Bill', user?._id)
        // sendApproveByContractor(newContractorBill, 'bill', createdBy)
        // console.log(ContractorBill)
        res.status(201).json({ message: 'Bill for contractor created successfully', ContractorBill });

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
            .exec();
        if (!bill) return res.status(404).json({ message: 'No Bill Found' });
        const existingSite = await Site.findById(bill?.site?.id);
        const existingContractor = await Contractor.findById(bill?.contractor?.id);
        if (bill.createdBy.toString() === user?._id.toString()) {
            if (bill.adminApprove === 'Approved' && bill.accountantApprove === 'Approved' && bill.accountheadApprove === 'Approved' && bill.inchargeApprove === 'Approved' && bill.qualityApprove === 'Approved') {
                bill.approvalStatus = 'Approved'
                await bill.save();
                existingSite.bill.push(bill._id);
                existingContractor.bill.push(bill._id);
                await existingSite.save();
                await existingContractor.save();
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
            contractor,
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
        const existingContractorBill = await Bill.findById(id)
            .where('createdBy').equals(user?._id)
            .exec();
        const existingWorkorder = await WorkOrder.findOne()
            .where('site.id').equals(site)
            .where('contractor.id').equals(contractor)
            .exec();
        workOrder = existingWorkorder.work?.filter((work) => work?.workDetail === billOf)[0];
        const workIndex = existingWorkorder?.work.indexOf(workOrder);
        existingContractorBill.site = site || existingContractorBill.site;
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
        const existingSite = await Site.findById(bill.site.id);
        const existingContractor = await Contractor.findById(bill.contractor.id);
        existingSite.bill.splice(id, 1);
        await existingSite.save({ validateBeforeSave: false });
        existingContractor.bill.splice(id, 1);
        await existingContractor.save({ validateBeforeSave: false });
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