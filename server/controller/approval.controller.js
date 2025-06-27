const {
    Approval,
    Rejected,
    Approved
} = require('../models/approval.models');
const User = require('../models/user.models');
const Bill = require('../models/bill.models.js');
const PurchaseOrder = require('../models/purchaseOrder.models.js');
const WorkOrder = require('../models/workorder.models');
const { Leave } = require('../models/attendance.models.js');
const ExtraWork = require('../models/extrawork.models.js');
const Payment_Schedule = require('../models/paymentschedule.models.js');
const ProjectSchedule = require('../models/projectschedule.models.js');
const PurchaseRequest = require('../models/purchaserequest.models.js');
const QualitySchedule = require('../models/qualityschedule.models.js');

const getAllApprovals = async (req, res) => {
    try {
        const id = req.params.id;
        const pendingApproval = await Approval.find()
            .where('to.id').equals(id)
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .exec();
        if (pendingApproval.length === 0) return res.status(400).json({ message: 'No Approval Avaliable' });
        // console.log(pendingApproval)
        return res.status(201).json(pendingApproval);
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
};

const getAllRejects = async (req, res) => {
    try {
        const { id } = req.params;
        const reject = await Rejected.find()
            .where('by.id').equals(id)
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .exec();
        if (reject.length === 0) return res.status(400).json({ message: 'No Reject Avaliable' });
        // console.log(pendingApproval)
        return res.status(201).json(reject);
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
};

const getApprovalById = async (req, res) => {
    try {
        const id = req.params.id;
        // console.log('id:', id)
        const approval = await Approval.findById(id)
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .exec();
        // console.log(approval)
        if (!approval) return res.status(400).json({ message: 'No Approval Avaliable' });
        return res.status(201).json(approval);
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
};

const getAllApproved = async (req, res) => {
    try {
        const { id } = req.params;
        const approved = await Approved.find()
            .where('by.id').equals(id)
            .populate('by')
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .exec();
        if (approved.length === 0) return res.status(400).json({ message: 'No Approved Item Avaliable' });
        // console.log(pendingApproval)
        return res.status(201).json(approved);
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
}

const reject = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const { message } = req.body
        const approval = await Approval.findById(id)
        if (!approval) return res.status(400).json({ message: 'No Approval Avaliable' });
        switch (user.department) {
            case 'Ceo':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.adminApprove = 'Approved',
                            await bill.save();
                        saveReject(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    case 'Purchase Order':
                        const purchaseOrder = await PurchaseOrder.findById(approval?.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        purchaseOrder.adminApprove = 'Approved',
                            await purchaseOrder.save();
                        console.log(purchaseOrder)
                        saveReject(approval, user._id, 'Purchase Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseOrder.createdBy?.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Purchase Order has been Approved By Parveen Sir' });
                        break;

                    case 'Work Order':
                        const workOrder = await WorkOrder.findById(approval?.data._id)
                            .populate('createdBy')
                            .exec();
                        console.log('workOrder.createdBy:', workOrder.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        workOrder.adminApprove = 'Approved',
                            // remove it after fixing error -> 
                            // workOrder.approvalStatus = 'Approved'
                            await workOrder.save();
                        // console.log(workOrder)
                        saveReject(approval, user?._id, 'Work Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Work Order has been Approved By Parveen Sir' });
                        break;

                    case 'Leave':
                        const leave = await Leave.findById(approval?.data._id)
                            .populate('user.id')
                            .exec()
                        console.log(leave)
                        console.log("message", message)
                        approval.isApproved = false,
                            approval.data.approval = 'Rejected',
                            leave.approval = 'Rejected',
                            // console.log('before reject', approval.data)
                            await approval.save();
                        await leave.save();
                        // console.log('after reject', approval.data)
                        saveReject(approval, user?._id, 'Leave', message)
                        await Approval.findByIdAndDelete(approval?._id);
                        leave.user?.id.message.push('Leave has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Leave has been Approved By Parveen Sir' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Accountant':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.accoutantApprove = 'Approved'
                        await bill.save();
                        saveReject(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        // console.log('bill:', bill)
                        break;

                    case 'Purchase Order':
                        const purchaseOrder = await PurchaseOrder.findById(approval?.data._id);
                        approval.isApproved = true,
                            await approval.save();
                        purchaseOrder.adminApprove = 'Approved',
                            await purchaseOrder.save();
                        console.log(purchaseOrder)
                        saveApproved(approval, user._id, 'Purchase Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseOrder.createdBy.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    case 'Work Order':
                        const workOrder = await WorkOrder.findById(approval?.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        workOrder.adminApprove = 'Approved',
                            await workOrder.save();
                        console.log(workOrder)
                        saveApproved(approval, user?._id, 'Work Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        workOrder.createdBy?.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Account Head':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.accoutantApprove = 'Approved'
                        await bill.save();
                        saveReject(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        // console.log('bill:', bill)
                        break;

                    case 'Purchase Order':
                        const purchaseOrder = await PurchaseOrder.findById(approval?.data._id);
                        approval.isApproved = true,
                            await approval.save();
                        purchaseOrder.adminApprove = 'Approved',
                            await purchaseOrder.save();
                        console.log(purchaseOrder)
                        saveApproved(approval, user._id, 'Purchase Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseOrder.createdBy.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    case 'Work Order':
                        const workOrder = await WorkOrder.findById(approval?.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        workOrder.adminApprove = 'Approved',
                            await workOrder.save();
                        console.log(workOrder)
                        saveApproved(approval, user?._id, 'Work Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        workOrder.createdBy?.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Site Incharge':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.inchargeApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        // console.log('Inchargebill:', bill)
                        break;

                    case 'Work Order':
                        const workOrder = await WorkOrder.findById(approval?.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        workOrder.adminApprove = 'Approved',
                            await workOrder.save();
                        console.log(workOrder)
                        saveApproved(approval, user?._id, 'Work Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        workOrder.createdBy?.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Quality Engineer':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.qualityApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        // console.log('bill:', bill)
                        break;

                    default:
                        break;
                }
                break;

            case 'Contractor':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                        approval.isApproved = true,
                            await approval.save();
                        bill.contractorApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        // console.log('bill:', bill)
                        break;
                    default:
                        break;
                }
                break;

            case 'Supplier':
                switch (approval.approvalOf) {
                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                        approval.isApproved = true,
                            await approval.save();
                        bill.supplierApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        // console.log('bill:', bill)
                        break;

                    case 'Purchase Order':
                        const purchaseOrder = await PurchaseOrder.findById(approval?.data._id);
                        approval.isApproved = true,
                            await approval.save();
                        purchaseOrder.supplierApprove = 'Approved',
                            await purchaseOrder.save();
                        console.log(purchaseOrder)

                        saveApproved(approval, user._id, 'Purchase Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseOrder.createdBy.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    default:
                        break;
                }
                break;

            default:
                return res.status(401).json({ message: 'Unauthorized' })
                break;
        }
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
}

const saveReject = async (data, by, approvalOf, message) => {
    try {
        const existingUser = await User.findById(by)
        if (!existingUser) {
            console.log('User not found');
            return;
        };
        const newRejected = new Rejected({
            data,
            by: { id: existingUser?._id, name: existingUser.userName },
            approvalOf,
            message,
        });
        console.log(newRejected)
        const savedRejected = await newRejected.save();
        if (existingUser.rejected) {
            existingUser.rejected.push(savedRejected._id);
            await existingUser.save();
        } else {
            console.log('existingUser.rejected is not an array or is undefined');
        }
    } catch (error) {
        console.log(error);
    }
};

const saveApproved = async (data, by, approvalOf) => {
    try {
        const existingUser = await User.findById(by)
        if (!existingUser) {
            console.log('User not found');
            return;
        };
        const newApproved = new Approved({
            data,
            by: { id: existingUser?._id, name: existingUser.userName },
            approvalOf
        });
        const savedApproval = await newApproved.save();
        if (existingUser.approved) {
            existingUser.approved.push(savedApproval._id);
            await existingUser.save();
        } else {
            console.log('existingUser.approved is not an array or is undefined');
        }
        // console.log(approved)
    } catch (error) {
        console.log(error);
    }
};

const deleteApproved = async (req, res) => {
    try {
        const id = req.params.id;
        const approval = await Approved.findByIdAndDelete(id);
        if (!approval) return res.status(400).json({ message: 'No Approval Avaliable' });
        return res.status(201).json({ message: 'Deleted Sucessfully' });
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
};

const approve = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        // console.log('user:'
        const approval = await Approval.findById(id)
        if (!approval) return res.status(400).json({ message: 'No Approval Avaliable' });
        switch (user.department) {
            case 'Ceo':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)

                        approval.isApproved = true,
                            await approval.save();
                        bill.adminApprove = 'Approved',
                            await bill.save();

                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        // bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    case 'Purchase Order':
                        const purchaseOrder = await PurchaseOrder.findById(approval?.data._id)
                        approval.isApproved = true,
                            await approval.save();
                        purchaseOrder.adminApprove = 'Approved',
                            await purchaseOrder.save();
                        console.log(purchaseOrder)
                        saveApproved(approval, user._id, 'Purchase Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseOrder.createdBy?.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Purchase Order has been Approved By Parveen Sir' });
                        break;

                    case 'Purchase Request':
                        const purchaseRequest = await PurchaseRequest.findById(approval?.data._id)
                        approval.isApproved = true,
                            await approval.save();
                        purchaseRequest.adminApprove = 'Approved',
                            await purchaseRequest.save();
                        console.log(purchaseRequest)
                        saveApproved(approval, user._id, 'Purchase Request')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseRequest.createdBy?.message.push('Purchase Request has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Purchase Request has been Approved By Parveen Sir' });
                        break;

                    case 'Work Order':
                        const workOrder = await WorkOrder.findById(approval?.data._id)
                        console.log('workOrder.createdBy:', workOrder.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        workOrder.adminApprove = 'Approved',

                            await workOrder.save();
                        // console.log(workOrder)
                        saveApproved(approval, user?._id, 'Work Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        // workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Work Order has been Approved By Parveen Sir' });
                        break;

                    case 'Extra Work':
                        const extraWork = await ExtraWork.findById(approval?.data._id)
                        console.log('extraWork.createdBy:', extraWork.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        extraWork.adminApprove = 'Approved',
                            await extraWork.save();
                        // console.log(workOrder)
                        saveApproved(approval, user?._id, 'Extra Work')
                        await Approval.findByIdAndDelete(approval?._id);
                        // workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Extra Work has been Approved By Parveen Sir' });
                        break;

                    case 'Payment Schedule':
                        const paymentSchedule = await Payment_Schedule.findById(approval?.data._id)
                        console.log('paymentSchedule.createdBy:', paymentSchedule.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        paymentSchedule.adminApprove = 'Approved',
                            await paymentSchedule.save();
                        // console.log(workOrder)
                        saveApproved(approval, user?._id, 'Payment Schedule')
                        await Approval.findByIdAndDelete(approval?._id);
                        // workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Payment Schedule has been Approved By Parveen Sir' });
                        break;

                    case 'Project Schedule':
                        const projectSchedule = await ProjectSchedule.findById(approval?.data._id)
                        console.log('paymentSchedule.createdBy:', projectSchedule.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        projectSchedule.adminApprove = 'Approved',
                            await projectSchedule.save();
                        // console.log(workOrder)
                        saveApproved(approval, user?._id, 'Project Schedule')
                        await Approval.findByIdAndDelete(approval?._id);
                        // workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Project Schedule has been Approved By Parveen Sir' });
                        break;

                    case 'Quality Schedule':
                        const qualitySchedule = await QualitySchedule.findById(approval?.data._id)
                        console.log('qualitySchedule.createdBy:', qualitySchedule.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        qualitySchedule.adminApprove = 'Approved',
                            await qualitySchedule.save();
                        // console.log(qualitySchedule)
                        saveApproved(approval, user?._id, 'Quality Schedule')
                        await Approval.findByIdAndDelete(approval?._id);
                        // qualitySchedule.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Quality Schedule has been Approved By Parveen Sir' });
                        break;

                    case 'Leave':
                        const leave = await Leave.findById(approval?.data._id)
                            .populate('user.id')
                            .exec()
                        console.log(leave)
                        approval.isApproved = true,
                            approval.data.approval = 'Approved',
                            leave.approval = 'Approved',
                            console.log('before approval', approval.data)
                        await approval.save();
                        await leave.save();
                        console.log('after approval', approval.data)
                        saveApproved(approval, user?._id, 'Leave')
                        await Approval.findByIdAndDelete(approval?._id);
                        leave.user?.id.message.push('Leave has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Leave has been Approved By Parveen Sir' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Accountant':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.accountantApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Accountant');
                        res.status(201).json({ message: 'Bill has been Approved By Accountant' });
                        // console.log('bill:', bill)
                        break;

                    case 'Purchase Request':
                        const purchaseRequest = await PurchaseRequest.findById(approval?.data._id)
                        approval.isApproved = true,
                            await approval.save();
                        purchaseRequest.accountantApprove = 'Approved',
                            await purchaseRequest.save();
                        console.log(purchaseRequest)
                        saveApproved(approval, user._id, 'Purchase Request')
                        await Approval.findByIdAndDelete(approval?._id);
                        // purchaseRequest.createdBy?.message.push('Purchase Request has been Approved By Accounts');
                        res.status(201).json({ message: 'Purchase Request has been Approved By Accounts' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Account Head':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.accountheadApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Accounts');
                        res.status(201).json({ message: 'Bill has been Approved By Accounts' });
                        // console.log('bill:', bill)
                        break;

                    case 'Purchase Order':
                        const purchaseOrder = await PurchaseOrder.findById(approval?.data._id);
                        approval.isApproved = true,
                            await approval.save();
                        purchaseOrder.accountheadApprove = 'Approved',
                            await purchaseOrder.save();
                        console.log(purchaseOrder)
                        saveApproved(approval, user._id, 'Purchase Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseOrder.createdBy.message.push('Purchase Order has been Approved By Accounts');
                        res.status(201).json({ message: 'Bill has been Approved By Accounts' });
                        break;

                    case 'Work Order':
                        const workOrder = await WorkOrder.findById(approval?.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        workOrder.accountheadApprove = 'Approved',
                            await workOrder.save();
                        console.log(workOrder)
                        saveApproved(approval, user?._id, 'Work Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        workOrder.createdBy?.message.push('Purchase Order has been Approved By Accounts');
                        res.status(201).json({ message: 'Bill has been Approved By Accounts' });
                        break;

                    case 'Extra Work':
                        const extraWork = await ExtraWork.findById(approval?.data._id)
                        console.log('extraWork.createdBy:', extraWork.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        extraWork.accountheadApprove = 'Approved',
                            await extraWork.save();
                        // console.log(workOrder)
                        saveApproved(approval, user?._id, 'Extra Work')
                        await Approval.findByIdAndDelete(approval?._id);
                        // workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Extra Work has been Approved By Accounts' });
                        break;

                    case 'Payment Schedule':
                        const paymentSchedule = await Payment_Schedule.findById(approval?.data._id)
                        console.log('paymentSchedule.createdBy:', paymentSchedule.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        paymentSchedule.accountheadApprove = 'Approved',
                            await paymentSchedule.save();
                        // console.log(workOrder)
                        saveApproved(approval, user?._id, 'Payment Schedule')
                        await Approval.findByIdAndDelete(approval?._id);
                        // workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Extra Work has been Approved By Accounts' });
                        break;

                    case 'Project Schedule':
                        const projectSchedule = await ProjectSchedule.findById(approval?.data._id)
                        console.log('paymentSchedule.createdBy:', projectSchedule.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        projectSchedule.accountheadApprove = 'Approved',
                            await projectSchedule.save();
                        // console.log(workOrder)
                        saveApproved(approval, user?._id, 'Project Schedule')
                        await Approval.findByIdAndDelete(approval?._id);
                        // workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Extra Work has been Approved By Accounts' });
                        break;

                    case 'Purchase Request':
                        const purchaseRequest = await PurchaseRequest.findById(approval?.data._id)
                        approval.isApproved = true,
                            await approval.save();
                        purchaseRequest.accountheadApprove = 'Approved',
                            await purchaseRequest.save();
                        console.log(purchaseRequest)
                        saveApproved(approval, user._id, 'Purchase Request')
                        await Approval.findByIdAndDelete(approval?._id);
                        // purchaseRequest.createdBy?.message.push('Purchase Request has been Approved By Accounts');
                        res.status(201).json({ message: 'Purchase Request has been Approved By Accounts' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Site Incharge':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.inchargeApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Incharge');
                        res.status(201).json({ message: 'Bill has been Approved By Incharge' });
                        // console.log('Inchargebill:', bill)
                        break;

                    case 'Work Order':
                        const workOrder = await WorkOrder.findById(approval?.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        workOrder.inchargeApprove = 'Approved',
                            await workOrder.save();
                        console.log(workOrder)
                        saveApproved(approval, user?._id, 'Work Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        workOrder.createdBy?.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    case 'Project Schedule':
                        const projectSchedule = await ProjectSchedule.findById(approval?.data._id)
                        console.log('paymentSchedule.createdBy:', projectSchedule.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        projectSchedule.inchargeApprove = 'Approved',
                            await projectSchedule.save();
                        // console.log(workOrder)
                        saveApproved(approval, user?._id, 'Project Schedule')
                        await Approval.findByIdAndDelete(approval?._id);
                        // workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Extra Work has been Approved By Incharge' });
                        break;

                    case 'Purchase Request':
                        const purchaseRequest = await PurchaseRequest.findById(approval?.data._id)
                        approval.isApproved = true,
                            await approval.save();
                        purchaseRequest.inchargeApprove = 'Approved',
                            await purchaseRequest.save();
                        console.log(purchaseRequest)
                        saveApproved(approval, user._id, 'Purchase Request')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseRequest.createdBy?.message.push('Purchase Request has been Approved By Incharge');
                        res.status(201).json({ message: 'Purchase Request has been Approved By Incharge' });
                        break;

                    case 'Quality Schedule':
                        const qualitySchedule = await QualitySchedule.findById(approval?.data._id)
                        console.log('qualitySchedule.createdBy:', qualitySchedule.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        qualitySchedule.inchargeApprove = 'Approved',
                            await qualitySchedule.save();
                        // console.log(qualitySchedule)
                        saveApproved(approval, user?._id, 'Quality Schedule')
                        await Approval.findByIdAndDelete(approval?._id);
                        // qualitySchedule.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Quality Schedule has been Approved By Incharge' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Quality Engineer':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.qualityApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Quality');
                        res.status(201).json({ message: 'Bill has been Approved By Quality' });
                        // console.log('bill:', bill)
                        break;

                    case 'Quality Schedule':
                        const qualitySchedule = await QualitySchedule.findById(approval?.data._id)
                        console.log('qualitySchedule.createdBy:', qualitySchedule.createdBy)
                        approval.isApproved = true,
                            await approval.save();
                        qualitySchedule.qualityApprove = 'Approved',
                            await qualitySchedule.save();
                        // console.log(qualitySchedule)
                        saveApproved(approval, user?._id, 'Quality Schedule')
                        await Approval.findByIdAndDelete(approval?._id);
                        // qualitySchedule.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Quality Schedule has been Approved By Quality' });
                        break;

                    default:
                        break;
                }
                break;

            case 'Contractor':
                switch (approval.approvalOf) {

                    case 'Bill':
                        const bill = await Bill.findById(approval.data._id)
                        approval.isApproved = true,
                            await approval.save();
                        bill.contractorApprove = 'Approved'
                        await bill.save();
                        saveApproved(approval, user._id, 'Bill'),
                            await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        // console.log('bill:', bill)
                        break;
                    default:
                        break;
                }
                break;

            case 'Supplier':
                switch (approval.approvalOf) {

                    case 'Purchase Order':
                        const purchaseOrder = await PurchaseOrder.findById(approval?.data._id);
                        approval.isApproved = true,
                            await approval.save();
                        purchaseOrder.supplierApprove = 'Approved',
                            await purchaseOrder.save();
                        console.log(purchaseOrder)
                        saveApproved(approval, user._id, 'Purchase Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseOrder.createdBy.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({ message: 'Bill has been Approved By Parveen Sir' });
                        break;

                    default:
                        break;
                }
                break;

            default:
                return res.status(401).json({ message: 'Unauthorized' })
                break;
        }
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
};

const sendApproveByAdmin = async (data, approvalof, by) => {
    try {
        const admin = await User.findOne()
            .where('department').equals('Ceo')
            .select('-password -refreshToken')
            .exec();

        const existingUser = await User.findById(by)
            .select('-password -refreshToken')
            .exec();

        console.log(existingUser)

        if (!existingUser) {
            console.log('User not found');
            return;
        }

        const newApproval = new Approval({
            data,
            to: { id: admin._id, name: admin.userName },
            by: {
                name: existingUser.userName,
                id: by
            },
            approvalOf: approvalof,
        });
        const adminApprove = await newApproval.save();
        console.log(adminApprove)
        if (admin) {
            admin.pending.push(adminApprove._id);
            await admin.save();
        } else {
            console.log('existingUser.pending is not an array or is undefined');
        }
    } catch (error) {
        console.log(error);
    }
};

// const sendApproveByClient = async (data, approvalof, by) => {
//     try {
//         // console.log('data:', data);
//         const existingUser = await User.find()
//             .where('department').equals('Client')
//             .select('-password -refreshToken')
//             .exec();

//         if (existingUser.length === 0) {
//             console.log('User not found');
//             return;
//         }

//         console.log(approvalof)
//         const newApproval = new Approval({
//             data,
//             to: existingUser._id,
//             by,
//             approvalOf: approvalof,
//         });
//         const adminApprove = await newApproval.save();

//         if (existingUser.pending) {
//             existingUser.pending.push(adminApprove._id);
//             await existingUser.save();
//         } else {
//             console.log('existingUser.pending is not an array or is undefined');
//         }

//         // console.log(existingUser);
//         console.log('adminApprove:', adminApprove)
//     } catch (error) {
//         console.log(error);
//     }
// };

const sendApproveByIncharge = async (data, approvalof, by) => {
    try {
        console.log('data', data)
        console.log('data:', { data })
        const existingIncharge = await User.findOne()
            .where('department').equals('Site Incharge')
            .where('site.id').equals(data.site.id)
            .select('-password -refreshToken')
            .exec();


        if (!existingIncharge) {
            console.log('User not found');
            return;
        }
        const existingUser = await User.findById(by)
            .select('-password -refreshToken')
            .exec();

        console.log(existingUser)

        if (!existingUser) {
            console.log('User not found');
            return;
        }
        const newApproval = new Approval({
            data,
            to: { id: existingIncharge?._id, name: existingIncharge.userName },
            by: {
                name: existingUser.userName,
                id: by
            },
            approvalOf: approvalof,
        });
        const inchargeApprove = await newApproval.save();

        if (inchargeApprove) {
            existingIncharge.pending.push(inchargeApprove._id);
            await existingIncharge.save();
        } else {
            console.log('inchargeApprove is not saved');
        }

        console.log('inchargeApprove:', inchargeApprove)
    } catch (error) {
        console.log(error);
    }
};

const sendApproveByAccountant = async (data, approvalof, by) => {
    try {
        const existingAccountant = await User.findOne()
            .where('department').equals('Accountant')
            .select('-password -refreshToken')
            .exec();

        if (!existingAccountant) {
            console.log('User not found');
            return;
        }
        const existingUser = await User.findById(by)
            .select('-password -refreshToken')
            .exec();

        console.log(existingUser)

        if (!existingUser) {
            console.log('User not found');
            return;
        }

        const newApproval = new Approval({
            data,
            to: { id: existingAccountant?._id, name: existingAccountant.userName },
            by: {
                name: existingUser.userName,
                id: by
            },
            approvalOf: approvalof,
        });
        const accountantApprove = await newApproval.save();

        if (accountantApprove) {
            existingAccountant.pending.push(accountantApprove._id);
            await existingAccountant.save();
        } else {
            console.log('accountantApprove  is not saved');
        }

        // console.log('accountantApprove:', accountantApprove)
    } catch (error) {
        console.log(error);
    }
};

const sendApproveByAccountHead = async (data, approvalof, by) => {
    try {
        const existingAccountant = await User.findOne()
            .where('department').equals('Account Head')
            .select('-password -refreshToken')
            .exec();

        if (!existingAccountant) {
            console.log('User not found');
            return;
        }
        console.log('existingAccountant:', existingAccountant)
        const existingUser = await User.findById(by)
            .select('-password -refreshToken')
            .exec();

        console.log(existingUser)

        if (!existingUser) {
            console.log('User not found');
            return;
        }
        const newApproval = new Approval({
            data,
            to: { id: existingAccountant?._id, name: existingAccountant.userName },
            by: {
                name: existingUser.userName,
                id: by
            },
            approvalOf: approvalof,
        });
        const accountantApprove = await newApproval.save();
        existingAccountant.pending.push(accountantApprove._id);
        await existingAccountant.save();

        // console.log('accountantApprove:', accountantApprove)
    } catch (error) {
        console.log(error);
    }
};

const sendApproveByQuality = async (data, approvalof, by) => {
    try {
        const existingQuality = await User.findOne()
            .where('site.id').equals(data.site.id)
            .where('department').equals('Quality Engineer')
            .select('-password -refreshToken')
            .exec();

        if (!existingQuality) {
            console.log('User not found');
            return;
        }
        const existingUser = await User.findById(by)
            .select('-password -refreshToken')
            .exec();

        console.log(existingUser)

        if (!existingUser) {
            console.log('User not found');
            return;
        }
        // console.log('existingQuality:', existingQuality)
        const newApproval = new Approval({
            data,
            to: { id: existingQuality?._id, name: existingQuality.userName },
            by: {
                name: existingUser.userName,
                id: by
            },
            approvalOf: approvalof,
        });
        const qualityApprove = await newApproval.save();

        existingQuality.pending.push(qualityApprove._id);
        await existingQuality.save();

        // console.log('qualityApprove:', qualityApprove)
    } catch (error) {
        console.log(error);
    }
};

const sendApproveByContractor = async (data, approvalof, by) => {
    try {
        const existingContractor = await User.findOne()
            .where('department').equals('Contractor')
            .where('site.id').equals(data.site.id)
            .select('-password -refreshToken')
            .exec();

        if (!existingContractor) {
            console.log('Contractor not found');
            return;
        }
        const existingUser = await User.findById(by)
            .select('-password -refreshToken')
            .exec();

        console.log(existingUser)

        if (!existingUser) {
            console.log('User not found');
            return;
        }
        const newApproval = new Approval({
            data,
            to: { id: existingContractor?._id, name: existingContractor.userName },
            by: {
                name: existingUser.userName,
                id: by
            },
            approvalOf: approvalof,
        });

        const contractorApprove = await newApproval.save();

        if (!contractorApprove) {
            existingContractor.pending.push(contractorApprove._id);
            await existingContractor.save();
        } else {
            console.log('contractorApprove is not saved');
        }

        console.log('contractorApprove:', contractorApprove)
    } catch (error) {
        console.log(error);
    }
};

// const sendApproveBySupplier = async (data, approvalof, by) => {
//     try {
//         const existingSupplier = await User.findOne()
//             .where('department').equals('Supplier')
//             .where('site').equals(data.site)
//             .select('-password -refreshToken')
//             .exec();

//         if (!existingSupplier) {
//             console.log('Supplier not found');
//             return;
//         }

//         console.log(approvalof)
//         const newApproval = new Approval({
//             data,
//             to: existingSupplier._id,
//             by,
//             approvalOf: approvalof,
//         });
//         const supplierApprove = await newApproval.save();

//         if (existingSupplier.pending) {
//             existingSupplier.pending.push(supplierApprove._id);
//             await existingSupplier.save();
//         } else {
//             console.log('supplierApprove is not saved');
//         }

//         console.log('supplierApprove:', supplierApprove)
//     } catch (error) {
//         console.log(error);
//     }
// };

module.exports = {
    sendApproveByAdmin,
    sendApproveByAccountant,
    sendApproveByAccountHead,
    // sendApproveByClient,
    sendApproveByIncharge,
    sendApproveByQuality,
    sendApproveByContractor,
    // sendApproveBySupplier,
    getAllApprovals,
    getApprovalById,
    approve,
    getAllApproved,
    deleteApproved,
    reject,
    getAllRejects
}