const Bill = require('../models/bill.models.js');
const Site = require('../models/site.models');
const User = require('../models/user.models.js');
const mongoose = require('mongoose');
const Contractor = require('../models/contractor.models');
const {WorkOrder }= require('../models/workorder.models.js');
const ExtraWork = require("../models/extrawork.models.js");
const {LabourAttendance} = require("../models/attendance.models.js")
const {
    sendApproveByAdmin,
    sendApproveByAccountant,
    sendApproveByAccountHead,
    sendApproveByIncharge,
    sendApproveByQuality,
    sendApproveByContractor,
} = require('./approval.controller.js')
const { Ledger } = require('../models/ledger.models.js');
const { Journal } = require('../models/journal.models.js');
const { sendNotification } = require("./notification.controller.js");

const generateBillNo = async (req, res) => {
    try {
        const siteId = req.body.site;

        if (!siteId) {
            return res.status(400).json({ error: "Site ID is required" });
        }

        const site = await Site.findById(siteId);
        if (!site || !site.siteId) {
            return res.status(404).json({ error: "Site not found or siteId missing" });
        }

        const sitePrefix = site.siteId.toUpperCase(); // Use saved siteId like "OTC"
        const prefix = `${sitePrefix}/BILL/`;

        const lastBill = await Bill.findOne({ 'site.id': siteId, billNo: { $regex: `^${prefix}` } })
            .sort({ createdAt: -1 });

        let nextNumber = 1;
        if (lastBill?.billNo) {
            const match = lastBill.billNo.match(/(\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }

        const padded = String(nextNumber).padStart(3, '0');
        const billNo = `${prefix}${padded}`;

        return res.json({ billNo });
    } catch (error) {
        console.error("Error generating bill number:", error);
        return res.status(500).json({ error: error.message });
    }
};

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
// const createBill = async (req, res) => {
//   try {
//     const user = req.user;
//     const { site, contractor, billOf, toPay } = req.body;

//     const existingSite = await Site.findById(site);
//     const existingContractor = await Contractor.findById(contractor);

//     const existingWorkorder = await WorkOrder.findOne()
//       .where("site.id").equals(site)
//       .where("contractor.id").equals(contractor);

//     if (!existingWorkorder) {
//       return res.status(404).json({
//         message: "No WorkOrder found for the specified site and contractor."
//       });
//     }

//     // Find payable work item
//     const workOrder = existingWorkorder.work?.find(
//       work => work?._id.toString() === billOf
//     );

//     if (!workOrder) {
//       return res.status(404).json({
//         message: "Work item not found for this contractor and site"
//       });
//     }

//     // Work must have due > 0
//     if (workOrder.due <= 0) {
//       return res.status(400).json({
//         message: "This work has no pending amount to bill"
//       });
//     }

//     // Work must have at least one completed stage with due > 0
//     const validStages = (workOrder.workStages || []).filter(
//       stage => stage.status === "completed" && stage.due > 0
//     );

//     if (validStages.length === 0) {
//       return res.status(400).json({
//         message: "No completed workstage with pending due payment"
//       });
//     }

//     const newContractorBill = new Bill({
//       site: {
//         name: existingSite.name,
//         id: existingSite._id
//       },
//       contractor: {
//         name: existingContractor.name,
//         id: existingContractor._id
//       },
//       billOf: workOrder,
//       toPay,
//       amount: workOrder.amount,
//       createdBy: user?._id,
//     });

//     const ContractorBill = await newContractorBill.save();

//     const existingUser = await User.findById(user._id).select("-password -refreshToken");
//     const employees = await User.find({ role: "Employee" });

//     for (const employee of employees) {
//       employee.notification.push({
//         title: "Bill Alert",
//         message: `A bill was created by ${existingUser.userName} for ${existingSite.name}`,
//         createdAt: ContractorBill.createdAt || new Date(),
//       });
//       await employee.save();
//               sendNotification(
//                 employee.userId,
//                 `${user.userName} has created bill for ${existingSite.name}`
//               );
//     }

//     sendApproveByAdmin(ContractorBill, "Bill", user?._id);
//     sendApproveByIncharge(ContractorBill, "Bill", user?._id);
//     sendApproveByAccountHead(ContractorBill, "Bill", user?._id);
//     sendApproveByQuality(ContractorBill, "Bill", user?._id);

//     res.status(201).json({
//       message: "Bill for contractor created successfully",
//       ContractorBill,
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// };


const createBill = async (req, res) => {
  try {
    const {
      billType,
      site,
      contractor,
      amount,
      reference,
      meta
    } = req.body;

    if (!billType || !site || !amount)
      return res.status(400).json({ message: "Missing required fields" });

    if (!reference)
      return res.status(400).json({ message: "Missing reference object" });

    // Generate bill number
    const count = await Bill.countDocuments();
    const billNo = `BILL-${String(count + 1).padStart(4, "0")}`;

    const newBill = new Bill({
      billNo,
      billType,
      site,
      contractor: contractor || null,
      amount,
      reference,
      meta,
      createdBy: req.user._id
    });

    /* ----------------------------------------------------------
        WORK ORDER PAYMENT UPDATE
    ---------------------------------------------------------- */
    if (billType === "workorder") {
      const { workOrderId, workId, stageId } = reference;

      const order = await WorkOrder.findById(workOrderId);
      if (!order) return res.status(404).json({ message: "Work Order not found" });

      const work = order.works.id(workId);
      if (!work) return res.status(404).json({ message: "Work detail not found" });

      const stage = work.stages.id(stageId);
      if (!stage) return res.status(404).json({ message: "Stage not found" });

      // update paid/due
      stage.paid = Number(stage.paid || 0) + Number(amount);
      stage.due = Math.max(0, Number(stage.amount) - Number(stage.paid));

      // append bill reference
      stage.bill.push({ billId: newBill._id, paid: amount });

      // update work paid/due
      work.paid = (work.stages || []).reduce((sum, s) => sum + Number(s.paid || 0), 0);
      work.due = Math.max(0, work.amount - work.paid);

      // update work status
      const completed = work.stages.every(s => s.due === 0);
      const started = work.stages.some(s => s.paid > 0);

      if (completed) work.status = "Completed";
      else if (started) work.status = "In Progress";

      // recalc totals
      order.totalPaid = (order.works || []).reduce((sum, w) => sum + Number(w.paid || 0), 0);
      order.totalDue = (order.totalValue || 0) - order.totalPaid;

      await order.save();
    }

    /* ----------------------------------------------------------
        EXTRA WORK PAYMENT UPDATE
    ---------------------------------------------------------- */
    if (billType === "extrawork") {
      const { extraWorkId, extraDetailId } = reference;

      const ex = await ExtraWork.findById(extraWorkId);
      if (!ex) return res.status(404).json({ message: "Extra Work not found" });

      const row = ex.WorkDetail.id(extraDetailId);
      if (!row) return res.status(404).json({ message: "Extra Work row not found" });

      // update payment
      row.paid = Number(row.paid || 0) + Number(amount);
      row.due = Math.max(0, Number(row.amount) - Number(row.paid));

      row.bill.push({ billId: newBill._id, paid: amount });

      // header totals
      ex.paid = (ex.WorkDetail || []).reduce((sum, w) => sum + Number(w.paid || 0), 0);
      ex.due = Number(ex.totalAmount || 0) - ex.paid;

      await ex.save();
    }

    /* ----------------------------------------------------------
        SUPPLY LABOUR PAYMENT UPDATE
    ---------------------------------------------------------- */
    if (billType === "supplylabour") {
      const { labourAttendanceId } = reference;

      const row = await LabourAttendance.findById(labourAttendanceId);
      if (!row) return res.status(404).json({ message: "Attendance not found" });

      // calculate current due
      const total =
        row.skilledMale * row.skilledMaleRate +
        row.skilledFemale * row.skilledFemaleRate +
        row.unskilledMale * row.unskilledMaleRate +
        row.unskilledFemale * row.unskilledFemaleRate;

      row.paid = Number(row.paid || 0) + Number(amount);
      row.due = Math.max(0, total - row.paid);

      row.bill.push({ billId: newBill._id, paid: amount });

      await row.save();
    }

    /* ----------------------------------------------------------
        SAVE BILL
    ---------------------------------------------------------- */
    await newBill.save();

    return res.status(201).json({
      message: "Bill created successfully",
      bill: newBill
    });

  } catch (err) {
    console.error("createBill:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
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
            if (
                bill.adminApprove === 'Approved' && bill.accountheadApprove === 'Approved' && 
                bill.inchargeApprove === 'Approved'
                && bill.qualityApprove === 'Approved'
            ) {
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
                res.status(201).json({ message: 'Bill Saved Successfuly' })
                
                const contractorLedger = await Ledger.findOne({ referenceId: existingContractor._id, referenceType: 'Contractor' });
                const siteLedger = await Ledger.findOne({ referenceId: existingSite._id, referenceType: 'Site' });

                if (contractorLedger && siteLedger) {
                    const voucherCount = await Journal.countDocuments();
                    const voucherNo = `JRN-${String(voucherCount + 1).padStart(4, '0')}`;

                    const newJournal = new Journal({
                        voucherNo,
                        date: new Date(),
                        narration: `Bill for ${existingContractor.name} at site ${existingSite.name}`,
                        entries: [
                            {
                                account: { name: contractorLedger.name, id: contractorLedger._id },
                                type: 'Debit',
                                amount: bill.totalAmount, // Contractor is to receive
                                reference: 'Bill',
                                referenceId: bill._id,
                            },
                            {
                                account: { name: siteLedger.name, id: siteLedger._id },
                                type: 'Credit',
                                amount: bill.totalAmount, // Site is being charged
                                reference: 'Bill',
                                referenceId: bill._id,
                            },
                        ],
                        createdBy: user._id,
                    });

                    await newJournal.save();

                    // Optionally update ledger balance or add to transaction log
                    contractorLedger.payable = (contractorLedger.payable || 0) + bill.totalAmount;
                    siteLedger.paid = (siteLedger.paid || 0) + bill.totalAmount;
                    await contractorLedger.save();
                    await siteLedger.save();
                }
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
    generateBillNo
}