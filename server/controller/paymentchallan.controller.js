const PaymentChallan = require("../models/paymentchallan.models");
const {
  sendApproveByAdmin,
  sendApproveByAccountHead,
} = require("./approval.controller.js");
const User = require("../models/user.models.js");

const createChallan = async (req, res) => {
  try {
    const { challanType, items, remarks } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    let processedItems = [];
    let totalApprovedAmount = 0;

    for (let item of items) {
      // MANUAL ITEM
      if (item.isManual) {
        if (!item.partyName || !item.purpose || !item.approvedAmount) {
          return res
            .status(400)
            .json({ message: "Manual item missing fields" });
        }

        processedItems.push({
          isManual: true,
          partyName: item.partyName,
          purpose: item.purpose,
          approvedAmount: item.approvedAmount,
          paymentMode: item.paymentMode,
        });

        totalApprovedAmount += item.approvedAmount;
      }

      // SYSTEM ITEM
      else {
        let source;

        if (item.sourceType === "BILL") {
          source = await Bill.findById(item.sourceId);
        } else if (item.sourceType === "EXPENSE") {
          source = await Expense.findById(item.sourceId);
        }

        if (!source) {
          return res.status(404).json({ message: "Source not found" });
        }

        if (source.status !== "APPROVED") {
          return res.status(400).json({ message: "Item not approved" });
        }

        if (
          source.paymentStatus === "IN_CHALLAN" ||
          source.paymentStatus === "PAID"
        ) {
          return res
            .status(400)
            .json({ message: "Already in challan or paid" });
        }

        processedItems.push({
          isManual: false,
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          partyName: source.partyName,
          purpose: source.purpose,
          approvedAmount: source.approvedAmount || source.amount,
          paymentMode: item.paymentMode,
        });

        totalApprovedAmount += source.approvedAmount || source.amount;
      }
    }

    const challan = await PaymentChallan.create({
      challanNo: `CH-${Date.now()}`,
      challanType,
      status: "DRAFT",
      createdBy: req.user._id,
      items: processedItems,
      totalApprovedAmount,
      remarks,
    });

    const employees = await User.find({ role: "Employee" });

    for (const employee of employees) {
    //   sendPushNotification(
    //     employee._id,
    //     `Payment Schedule .`,
    //   );
    //   employee.notification.push({
    //     title: "Payment Schedule Alert",
    //     message: `A Payment Schedule created by ${existingUser.userName} for ${existingSite.name}`,
    //     createdAt: clientPaymentSchedule.createdAt
    //       ? clientPaymentSchedule.createdAt
    //       : new Date(),
    //     link: `/payment-schedule/${clientPaymentSchedule._id}`,
    //   });
    //   await employee.save();
    }

    return res.status(201).json({ challan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateChallan = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, remarks } = req.body;

    const challan = await PaymentChallan.findById(id);

    if (!challan) return res.status(404).json({ message: "Not found" });

    if (!["DRAFT", "REJECTED"].includes(challan.status)) {
      return res.status(400).json({ message: "Cannot edit after approval" });
    }

    let total = 0;

    const updatedItems = items.map((item) => {
      total += item.approvedAmount;
      return item;
    });

    challan.items = updatedItems;
    challan.totalApprovedAmount = total;
    challan.remarks = remarks;

    await challan.save();

    res.json({ challan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChallanById = async (req, res) => {
  try {
    const challan = await PaymentChallan.findById(req.params.id).populate(
      "createdBy approvedBy assignedTo",
    );

    if (!challan) return res.status(404).json({ message: "Not found" });

    res.json({ challan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllChallans = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) filter.status = status;

    const challans = await PaymentChallan.find(filter).sort({ createdAt: -1 });

    res.json({ challans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteChallan = async (req, res) => {
  try {
    const challan = await PaymentChallan.findById(req.params.id);

    if (!challan) return res.status(404).json({ message: "Not found" });

    if (!["DRAFT", "REJECTED"].includes(challan.status)) {
      return res.status(400).json({ message: "Cannot delete" });
    }

    await challan.deleteOne();

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendForApproval = async (req, res) => {
  try {
    const user = req.user;
    const challan = await PaymentChallan.findById(req.params.id);

    if (!challan) return res.status(404).json({ message: "Not found" });

    if (challan.status !== "DRAFT") {
      return res.status(400).json({ message: "Invalid status" });
    }

    challan.status = "PENDING_APPROVAL";
    await challan.save();

    sendApproveByAdmin(challan, "Payment Challan", user._id)

    res.json({ message: "Sent for approval" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const payChallanItem = async (req, res) => {
  try {
    const { challanId, itemId } = req.params;
    const { paidAmount, receiverName, signatureUrl, transactionRef } = req.body;

    const challan = await PaymentChallan.findById(challanId);

    if (!challan) return res.status(404).json({ message: "Challan not found" });

    if (!["APPROVED", "ISSUED", "IN_PROGRESS"].includes(challan.status)) {
      return res.status(400).json({ message: "Challan not ready" });
    }

    const item = challan.items.id(itemId);

    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.status === "PAID") {
      return res.status(400).json({ message: "Already paid" });
    }

    if (paidAmount > item.approvedAmount) {
      return res.status(400).json({ message: "Amount exceeds approved" });
    }

    // CASH VALIDATION
    if (item.paymentMode === "CASH") {
      if (!receiverName || !signatureUrl) {
        return res
          .status(400)
          .json({ message: "Signature & receiver required" });
      }
    }

    item.paidAmount = paidAmount;
    item.receiverName = receiverName;
    item.signatureUrl = signatureUrl;
    item.transactionRef = transactionRef;

    item.status = paidAmount === item.approvedAmount ? "PAID" : "PARTIAL";

    item.paidBy = req.user._id;
    item.paidAt = new Date();

    // update challan totals
    challan.totalPaidAmount = challan.items.reduce(
      (sum, i) => sum + (i.paidAmount || 0),
      0,
    );

    // update challan status
    const allPaid = challan.items.every((i) => i.status === "PAID");

    challan.status = allPaid ? "COMPLETED" : "IN_PROGRESS";

    await challan.save();

    res.json({ message: "Payment recorded", challan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignChallan = async (req, res) => {
  const { assignedTo } = req.body;

  const challan = await PaymentChallan.findById(req.params.id);

  challan.assignedTo = assignedTo;
  challan.status = "ISSUED";

  await challan.save();

  res.json({ message: "Assigned" });
};

module.exports = {
  createChallan,
  updateChallan,
  getAllChallans,
  getChallanById,
  deleteChallan,
  sendForApproval,
  payChallanItem,
  assignChallan,
};
