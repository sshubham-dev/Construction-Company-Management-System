const Bill = require("../models/bill.models.js");
const Site = require("../models/site.models");
const User = require("../models/user.models.js");
const mongoose = require("mongoose");
const Contractor = require("../models/contractor.models");
const { WorkOrder } = require("../models/workorder.models.js");
const ExtraWork = require("../models/extrawork.models.js");
const { LabourAttendance } = require("../models/attendance.models.js");
const {
  sendApproveByAdmin,
  sendApproveByAccountant,
  sendApproveByAccountHead,
  sendApproveByIncharge,
  sendApproveByQuality,
  sendApproveByContractor,
} = require("./approval.controller.js");
const { Ledger } = require("../models/ledger.models.js");
const { Journal } = require("../models/journal.models.js");
const { sendNotification } = require("./notification.controller.js");

const generateBillNo = async (req, res) => {
  try {
    const siteId = req.body.site;

    if (!siteId) {
      return res.status(400).json({ error: "Site ID is required" });
    }

    const site = await Site.findById(siteId);
    if (!site || !site.siteId) {
      return res
        .status(404)
        .json({ error: "Site not found or siteId missing" });
    }

    const sitePrefix = site.siteId.toUpperCase(); // Use saved siteId like "OTC"
    const prefix = `${sitePrefix}/BILL/`;

    const lastBill = await Bill.findOne({
      "site.id": siteId,
      billNo: { $regex: `^${prefix}` },
    }).sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastBill?.billNo) {
      const match = lastBill.billNo.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const padded = String(nextNumber).padStart(3, "0");
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
      .where("approvalStatus")
      .equals("Approved")
      .populate("site.id") // fetch full site details
      .populate("contractor.id") // fetch full contractor details
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();
    if (bills.length === 0)
      return res.status(404).json({ message: "No Bill Found" });
    const approvedBills = bills.filter(
      (bill) => bill.approvalStatus !== "Pending"
    );
    if (approvedBills.length === 0) {
      return res.status(404).json({ message: "No Bill Found" });
    } else {
      return res.status(201).json(approvedBills);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getDraftBills = async (req, res) => {
  try {
    const id = req.params.id;
    const bills = await Bill.find()
      .where("approvalStatus")
      .equals("Pending")
      .where("createdBy")
      .equals(id)
      .populate("site.id") // fetch full site details
      .populate("contractor.id") // fetch full contractor details
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();
    // console.log(bills)
    if (bills.length === 0)
      return res.status(404).json({ message: "No Bill Found" });
    return res.status(201).json(bills);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getBill = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const bill = await Bill.findById(id)
      .populate("site.id") // fetch full site details
      .populate("contractor.id") // fetch full contractor details
      .exec();
    console.log(bill);
    if (!bill) return res.status(404).json({ message: "No Bill Found" });
    return res.status(201).json(bill);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const siteBill = async (req, res) => {
  try {
    const id = req.params.id;
    const bills = await Bill.find()
      .where("approvalStatus")
      .equals("Approved")
      .where("site.id")
      .equals(id)
      .populate("site.id") // fetch full site details
      .populate("contractor.id") // fetch full contractor details
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();
    if (!bills.length === 0)
      return res.status(404).json({ message: "No Bill Found" });
    const approvedBills = bills.filter(
      (bill) => bill.approvalStatus !== "Pending"
    );
    if (approvedBills.length === 0) {
      return res.status(404).json({ message: "No Bill Found" });
    } else {
      return res.status(201).json(approvedBills);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
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
    const { billType, site, contractor, contractorId, toPay, reference, meta } =
      req.body;
    console.log(req.body);
    const user = req.user;
    if (!billType || !site || !toPay)
      return res.status(400).json({ message: "Missing required fields" });

    if (!reference)
      return res.status(400).json({ message: "Missing reference object" });
    const existingUser = await User.findById(user._id);
    const existingSite = await Site.findById(site);
    const existingContractor = await Contractor.findById(contractorId);

    // Generate bill number
    const count = await Bill.countDocuments();
    const billNo = `BILL-${String(count + 1).padStart(4, "0")}`;

    const newBill = new Bill({
      billNo,
      billType,
      site: { name: existingSite.name, id: existingSite._id },
      contractor: existingContractor
        ? { name: existingContractor.name, id: existingContractor._id }
        : { name: contractor },
      toPay,
      reference,
      billOf: meta,
      createdBy: req.user._id,
    });

    /* ----------------------------------------------------------
        WORK ORDER PAYMENT UPDATE
    ---------------------------------------------------------- */
    if (billType === "workorder") {
      const { workOrderId, workId, stageId } = reference;

      const order = await WorkOrder.findById(workOrderId);
      if (!order)
        return res.status(404).json({ message: "Work Order not found" });

      const work = order.works.filter((w) => w.id === workId)[0];
      if (!work)
        return res.status(404).json({ message: "Work detail not found" });

      const stage = work.stages.filter((s) => s.id === stageId)[0];
      if (!stage) return res.status(404).json({ message: "Stage not found" });

      // append bill reference
      stage.bill.push({ billId: newBill._id });

      // update work paid/due
      //   work.paid = (work.stages || []).reduce(
      //     (sum, s) => sum + Number(s.paid || 0),
      //     0
      //   );
      work.due = Math.max(0, work.amount - work.paid);

      // update work status
      const completed = work.stages.every((s) => s.due === 0);
      const started = work.stages.some((s) => s.paid > 0);

      if (completed) work.status = "Completed";
      else if (started) work.status = "In Progress";

      // recalc totals
      //   order.totalPaid = (order.works || []).reduce(
      //     (sum, w) => sum + Number(w.paid || 0),
      //     0
      //   );
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
      if (!row)
        return res.status(404).json({ message: "Extra Work row not found" });

      // update payment
      //   row.paid = Number(row.paid || 0) + Number(amount);
      //   row.due = Math.max(0, Number(row.amount) - Number(row.paid));

      row.bill.push({ billId: newBill._id });

      // header totals
      //   ex.paid = (ex.WorkDetail || []).reduce(
      //     (sum, w) => sum + Number(w.paid || 0),
      //     0
      //   );
      ex.due = Number(ex.totalAmount || 0) - ex.paid;

      await ex.save();
    }

    /* ----------------------------------------------------------
        SUPPLY LABOUR PAYMENT UPDATE
    ---------------------------------------------------------- */
    if (billType === "supplylabour") {
      const { labourAttendanceId } = reference;

      const row = await LabourAttendance.findById(labourAttendanceId);
      if (!row)
        return res.status(404).json({ message: "Attendance not found" });

      // calculate current due
      const total =
        row.skilledMale * row.skilledMaleRate +
        row.skilledFemale * row.skilledFemaleRate +
        row.unskilledMale * row.unskilledMaleRate +
        row.unskilledFemale * row.unskilledFemaleRate;

      //   row.paid = Number(row.paid || 0) + Number(amount);
      row.due = Math.max(0, total - row.paid);

      row.bill.push({ billId: newBill._id });

      await row.save();
    }

    /* ----------------------------------------------------------
    SAVE BILL
    ---------------------------------------------------------- */
    await newBill.save();

    sendApproveByAccountHead(newBill, "Bill", user._id);
    sendApproveByAdmin(newBill, "Bill", user._id);
    sendApproveByQuality(newBill, "Bill", user._id);
    sendApproveByIncharge(newBill, "Bill", user._id);
    const employee = await User.find({ role: "Employee" });
    for (let emp of employee) {
      sendNotification(
        emp._id,
        `A bill for ${existingSite.name} has been created by ${existingUser.userName}.`
      );
      emp.notification.push({
        title: "Bill Alert",
        message: `A Bill created by ${existingUser.userName} for ${existingSite.name}`,
        createdAt: newBill.createdAt
          ? newBill.createdAt.toLocaleString()
          : new Date().toLocaleString(),
        link: `/bill/${newBill.id}`,
      });
      await emp.save();
    }
    return res.status(201).json({
      message: "Bill created successfully",
      bill: newBill,
    });
  } catch (err) {
    console.error("createBill:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

const saveBill = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    // console.log(user)
    const bill = await Bill.findById(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    if (!bill) return res.status(404).json({ message: "No Bill Found" });
    const existingSite = await Site.findById(bill?.site?.id);
    const existingContractor = await Contractor.findById(bill?.contractor?.id);
    if (bill.createdBy.toString() === user?._id.toString()) {
      if (
        bill.adminApprove === "Approved" &&
        bill.accountheadApprove === "Approved" &&
        bill.inchargeApprove === "Approved" &&
        bill.qualityApprove === "Approved"
      ) {
        bill.approvalStatus = "Approved";
        await bill.save();
        existingSite.bill.push(bill._id);
        if (existingContractor) {
          existingContractor.bill.push(bill._id);
          await existingContractor.save();
        }
        await existingSite.save();

        const existingUser = await User.findById(user._id).select(
          "-password -refreshToken"
        );
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
          employee.notification.push({
            title: "Bill Alert",
            message: `A Bill created by ${existingUser.userName} for ${existingSite.name}`,
            createdAt: bill.updatedAt
              ? bill.updatedAt.toLocaleString()
              : new Date().toLocaleString(),
            link: `/bill/${bill.id}`,
          });
          await employee.save();
        }
        console.log("bill:", bill);
        res.status(201).json({ message: "Bill Saved Successfuly" });

        const contractorLedger = existingContractor
          ? await Ledger.findOne({
              referenceId: existingContractor._id,
              referenceType: "Contractor",
            })
          : bill.contractor.name;

        const siteLedger = await Ledger.findOne({
          referenceId: existingSite._id,
          referenceType: "Site",
        });

        if (contractorLedger && siteLedger) {
          const voucherCount = await Journal.countDocuments();
          const voucherNo = `JRN-${String(voucherCount + 1).padStart(4, "0")}`;

          const newJournal = new Journal({
            voucherNo,
            date: new Date(),
            narration: `Bill for ${
              existingContractor
                ? existingContractor.name
                : bill.contractor.name
            } at site ${existingSite.name}`,
            entries: [
              {
                account: {
                  name: existingContractor
                    ? contractorLedger.name
                    : bill.contractor.name,
                  id: existingContractor && contractorLedger._id,
                },
                type: "Debit",
                amount: bill.totalAmount, // Contractor is to receive
                reference: "Bill",
                referenceId: bill._id,
              },
              {
                account: { name: siteLedger.name, id: siteLedger._id },
                type: "Credit",
                amount: bill.totalAmount, // Site is being charged
                reference: "Bill",
                referenceId: bill._id,
              },
            ],
            createdBy: user._id,
          });

          await newJournal.save();

          // Optionally update ledger balance or add to transaction log
          existingContractor &&
            (contractorLedger.payable =
              (contractorLedger.payable || 0) + bill.totalAmount);
          siteLedger.paid = (siteLedger.paid || 0) + bill.totalAmount;
          existingContractor && (await contractorLedger.save());
          await siteLedger.save();
        }
      } else {
        console.log("Bill is Not Approved By Every One");
        return res
          .status(400)
          .json({ message: "Bill is Not Approved By Every One" });
      }
    } else {
      console.log("Unauthorized Request");
      return res.status(401).json({ message: "Unauthorized Request" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const updateBill = async (req, res) => {
  try {
    const billId = req.params.id;

    const {
      billType,
      site,
      contractor,
      contractorId,
      toPay,
      totalAmount,
      prevPaid,
      dueBefore,
      reference,
      meta,
      reason,
    } = req.body;

    const existingBill = await Bill.findById(billId);
    if (!existingBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // ✅ SITE UPDATE
    if (site) {
      const existingSite = await Site.findById(site);
      if (existingSite) {
        existingBill.site = {
          name: existingSite.name,
          id: existingSite._id,
        };
      }
    }

    // ✅ CONTRACTOR UPDATE
    if (billType === "workorder" || billType === "extrawork") {
      if (contractorId) {
        const existingContractor = await Contractor.findById(contractorId);
        if (existingContractor) {
          existingBill.contractor = {
            name: existingContractor.name,
            id: existingContractor._id,
          };
        }
      }
    } else {
      existingBill.contractor = {
        name: contractor || "Supply Labour",
        id: null,
      };
    }

    // ✅ CORE BILL DATA
    existingBill.billType = billType || existingBill.billType;
    existingBill.reference = reference || existingBill.reference;
    existingBill.billOf = meta || existingBill.billOf;
    existingBill.toPay = Number(toPay || existingBill.toPay);

    // ✅ PAYMENT TRACKING
    const paid = Number(prevPaid || existingBill.paidAmount || 0);
    const dueBeforeSafe = Number(dueBefore || 0);

    existingBill.paidAmount = paid;
    existingBill.due = Math.max(
      Number(totalAmount || existingBill.toPay) - paid,
      0
    );

    // ✅ OPTIONAL FIELDS
    if (reason !== undefined) {
      existingBill.reason = reason;
    }

    await existingBill.save();

    return res.status(200).json({
      message: "Bill updated successfully",
      bill: existingBill,
    });
  } catch (error) {
    console.error("Update Bill Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteBill = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    console.log(id);
    const bill = await Bill.findByIdAndDelete(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    // console.log(bill);
    if (!bill) return res.status(404).json({ message: "No Bill Found" });
    const existingSite = await Site.findById(bill.site.id);
    const existingContractor = await Contractor.findById(bill.contractor.id);
    existingSite.bill.splice(id, 1);
    await existingSite.save({ validateBeforeSave: false });
    existingContractor.bill.splice(id, 1);
    await existingContractor.save({ validateBeforeSave: false });
    return res.status(201).json({ message: "Bill Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
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
  generateBillNo,
};
