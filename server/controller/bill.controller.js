const Bill = require('../models/bill.models.js');
const PaymentSchedule = require('../models/paymentschedule.models');
const Site = require('../models/site.models');
const User = require('../models/user.models.js');
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
            .populate('site.id')        // fetch full site details
            .populate('contractor.id') // fetch full contractor details
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
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
            .populate('site.id')        // fetch full site details
            .populate('contractor.id') // fetch full contractor details
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
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
            .populate('site.id')        // fetch full site details
            .populate('contractor.id') // fetch full contractor details
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
            .where('site.id').equals(id)
            .populate('site.id')        // fetch full site details
            .populate('contractor.id') // fetch full contractor details
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
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
        console.log('site', site)
        console.log('contractor', contractor)

        const existingSite = await Site.findById(site);
        const existingContractor = await Contractor.findById(contractor);
        const existingWorkorder = await WorkOrder.findOne()
            .where('site.id').equals(site)
            .where('contractor.id').equals(contractor)
            .exec();

        if (!existingWorkorder) {
            return res.status(404).json({ message: 'No WorkOrder found for the specified site and contractor.' });
        }

        const workOrder = existingWorkorder.work?.find(work => work?.workDetail === billOf);
        if (!workOrder) {
            return res.status(404).json({ message: 'No matching work detail found in the work order.' });
        }

        console.log('workOrder', workOrder)
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
        const existingUser = await User.findById(user._id).select('-password -refreshToken');
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
            employee.notification.push({
                title: 'Bill Alert',
                message: `A Bill created by ${existingUser.userName} for ${existingSite.name}`,
                createdAt: `${ContractorBill.createdAt ? ContractorBill.createdAt.toLocaleString() : new Date().toLocaleString()}`,
                // link: `/bill/${ContractorBill}`,
            })
            await employee.save()
        }
        sendApproveByAdmin(ContractorBill, 'Bill', user?._id)
        sendApproveByIncharge(ContractorBill, 'Bill', user?._id)
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
            if (bill.adminApprove === 'Approved' && bill.accountheadApprove === 'Approved' && bill.inchargeApprove === 'Approved' && bill.qualityApprove === 'Approved') {
                bill.approvalStatus = 'Approved'
                await bill.save();
                existingSite.bill.push(bill._id);
                existingContractor.bill.push(bill._id);
                await existingSite.save();
                await existingContractor.save();

                const existingUser = await User.findById(user._id).select('-password -refreshToken');
                const employees = await User.find({ role: "Employee" });

                for (const employee of employees) {
                    employee.notification.push({
                        title: 'Bill Alert',
                        message: `A Bill created by ${existingUser.userName} for ${existingSite.name}`,
                        createdAt: bill.updatedAt ? bill.updatedAt.toLocaleString() : new Date().toLocaleString(),
                        link: `/bill/${bill.id}`,
                    })
                    await employee.save()
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
        const { site, contractor, createdBy, billOf, toPay, reason } = req.body;

        const existingSite = await Site.findById(site);
        const existingContractor = await Contractor.findById(contractor);
        const existingContractorBill = await Bill.findById(id);
        const existingWorkorder = await WorkOrder.findOne()
            .where('site.id').equals(site)
            .where('contractor.id').equals(contractor)
            .exec();

        if (!existingContractorBill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const workOrder = existingWorkorder?.work?.find((w) => w?.workDetail === billOf);

        if (existingSite) {
            existingContractorBill.site = {
                name: existingSite.name,
                id: existingSite._id
            }
        }

        if (existingContractor) {
            existingContractorBill.contractor = {
                name: existingContractor.name,
                id: existingContractor._id
            };
        }


        existingContractorBill.createdBy = createdBy || existingContractorBill.createdBy;
        existingContractorBill.billOf = workOrder || existingContractorBill.billOf;
        existingContractorBill.amount = workOrder?.amount || existingContractorBill.amount;
        existingContractorBill.toPay = toPay || existingContractorBill.toPay;
        existingContractorBill.reason = reason || existingContractorBill.reason;

        await existingContractorBill.save();
        console.log("Updated Bill:", existingContractorBill);


        // Optional: link bill to workOrder
        if (workOrder) {
            workOrder.bill.push(existingContractorBill._id);
            await existingWorkorder.save();
        }

        res.status(201).json({ message: 'Bill Updated Sucessfully' });
    } catch (error) {
        console.error(error);
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