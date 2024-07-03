const {
    Approval,
    Rejected,
    Approved
} = require('../models/approval.models');
const User = require('../models/user.models');
const Bill = require('../models/bill.models.js');
const PurchaseOrder = require('../models/purchaseOrder.models.js');
const WorkOrder = require('../models/workorder.models');

const getAllApprovals = async (req, res) => {
    try {
        const { id } = req.params;
        const pendingApproval = await Approval.find()
            .where('to').equals(id)
            .populate('by to')
            .exec();
        if (pendingApproval.length === 0) return res.status(400).json({ message: 'No Approval Avaliable' });
        // console.log(pendingApproval)
        return res.status(201).json(pendingApproval);
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
            .populate('by to')
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
            .where('by').equals(id)
            .populate('by')
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
        // console.log('user:'
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Purchase Order has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Work Order has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
                        break;

                    default:
                        break;
                }
                break;

            default:
                return res.status(401).json({ message: 'Unauthorized' })
                break;
        }
        // console.log('approval:', approval)
        res.status(201).json({ message: 'Approved' })
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
 }

const saveReject = async (data, by, approvalOf) => {
    try {
        const existingUser = await User.findById(by)
        if (!existingUser) {
            console.log('User not found');
            return;
        };
        const newApproved = new Approved({
            data,
            by: existingUser?._id,
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

const saveApproved = async (data, by, approvalOf) => {
    try {
        const existingUser = await User.findById(by)
        if (!existingUser) {
            console.log('User not found');
            return;
        };
        const newApproved = new Approved({
            data,
            by: existingUser?._id,
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
                            .populate('createdBy')
                            .exec();
                        approval.isApproved = true,
                            await approval.save();
                        bill.adminApprove = 'Approved',
                            await bill.save();

                        saveApproved(approval, user._id, 'Bill'), 
                        await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        saveApproved(approval, user._id, 'Purchase Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        purchaseOrder.createdBy?.message.push('Purchase Order has been Approved By Parveen Sir');
                        res.status(201).json({message: 'Purchase Order has been Approved By Parveen Sir'});
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
                        saveApproved(approval, user?._id, 'Work Order')
                        await Approval.findByIdAndDelete(approval?._id);
                        workOrder.createdBy?.message.push('Work Order has been Approved By Parveen Sir');
                        res.status(201).json({message: 'Work Order has been Approved By Parveen Sir'});
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
                        saveApproved(approval, user._id, 'Bill'), 
                        await Approval.findByIdAndDelete(approval?._id);
                        bill.createdBy.message.push('Bill has been Approved By Parveen Sir');
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
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
                        res.status(201).json({message: 'Bill has been Approved By Parveen Sir'});
                        break;

                    default:
                        break;
                }
                break;

            default:
                return res.status(401).json({ message: 'Unauthorized' })
                break;
        }
        // console.log('approval:', approval)
        res.status(201).json({ message: 'Approved' })
    } catch (error) {
        console.log(error)
        res.status(501).json({ message: 'Internal Server Error', error });
    }
};

const sendApproveByAdmin = async (data, approvalof, by) => {
    try {
        const existingUser = await User.findOne()
            .where('department').equals('Ceo')
            .select('-password -refreshToken')
            .exec();

        if (!existingUser) {
            console.log('User not found');
            return;
        }

        const newApproval = new Approval({
            data,
            to: existingUser._id,
            by,
            approvalOf: approvalof,
        });
        const adminApprove = await newApproval.save();

        if (existingUser) {
            existingUser.pending.push(adminApprove._id);
            await existingUser.save();
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
        const existingIncharge = await User.findOne()
            .where('department').equals('Site Incharge')
            .where('site').equals(data.site)
            .select('-password -refreshToken')
            .exec();

        if (!existingIncharge) {
            console.log('User not found');
            return;
        }

        const newApproval = new Approval({
            data,
            to: existingIncharge?._id,
            by,
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

        const newApproval = new Approval({
            data,
            to: existingAccountant?._id,
            by,
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

const sendApproveByQuality = async (data, approvalof, by) => {
    try {
        const existingQuality = await User.findOne()
            .where('site').equals(data.site)
            .where('department').equals('Quality Engineer')
            .select('-password -refreshToken')
            .exec();

        if (!existingQuality) {
            console.log('User not found');
            return;
        }

        // console.log('existingQuality:', existingQuality)
        const newApproval = new Approval({
            data,
            to: existingQuality?._id,
            by,
            approvalOf: approvalof,
        });
        const qualityApprove = await newApproval.save();

        if (qualityApprove) {
            existingQuality.pending.push(qualityApprove._id);
            await existingQuality.save();
        } else {
            console.log('qualityApprove is not saved');
        }

        // console.log('qualityApprove:', qualityApprove)
    } catch (error) {
        console.log(error);
    }
};

const sendApproveByContractor = async (data, approvalof, by) => {
    try {
        const existingContractor = await User.findOne()
            .where('department').equals('Contractor')
            .where('site').equals(data.site)
            .select('-password -refreshToken')
            .exec();

        if (!existingContractor) {
            console.log('Contractor not found');
            return;
        }

        const newApproval = new Approval({
            data,
            to: existingContractor?._id,
            by,
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
    reject
}