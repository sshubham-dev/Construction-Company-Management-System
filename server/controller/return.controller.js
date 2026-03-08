const Return = require("../models/return.models"); // Assuming the model is in the models folder
const {
  sendApproveByAdmin,
  sendApproveByStoreIncharge,
} = require("./approval.controller.js");
const Site = require("../models/site.models");
const User = require("../models/user.models");
const {sendPushNotification, notifyRole} = require("../utils/pushNotification.js");
const SalesInvoice = require("../models/salesinvoice.models.js");

// Create a return
const createReturn = async (req, res) => {
  try {
    const user = req.user;
    const { site, materialType, date, returnable, salesInvoiceId } = req.body;

    const existingSite = await Site.findById(site);
    if (!existingSite) {
      return res.status(400).json({ message: "Site not found" });
    }

    const salesInvoice = await SalesInvoice.findById(salesInvoiceId);
    if (!salesInvoice || salesInvoice.status !== "Posted") {
      return res.status(400).json({
        message: "Invalid or unposted Sales Invoice",
      });
    }

    // Build returnable items from Sales Invoice
    const generatedReturnable = salesInvoice.items.map((invItem, index) => {
      const userItem = returnable?.[index];

      return {
        item: invItem.item, // 🔒 non-editable
        unit: invItem.unit, // 🔒 from invoice
        quantity: Number(userItem?.quantity || 0), // ✅ user input
        rate: invItem.rate, // hidden
        amount: userItem?.quantity * invItem.rate, // hidden
      };
    });

    const newReturn = new Return({
      site: { id: existingSite._id, name: existingSite.name },
      materialType,
      date,
      returnable: generatedReturnable,
      createdBy: user._id,
      salesInvoice: { id: salesInvoice._id, invoiceNo: salesInvoice.invoiceNo },
    });
    const savedReturn = await newReturn.save();
    sendApproveByStoreIncharge(savedReturn, "Return", user._id);
    const existingUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const employees = await User.find({ role: "Employee" });

    for (const employee of employees) {
      employee.notification.push({
        title: "Material Retrun Alert",
        message: `A Material Retrun Requested by ${existingUser.userName} for ${existingSite.name}`,
        createdAt: savedReturn.createdAt ? savedReturn.createdAt : new Date(),
        link: `/sites/return/${savedReturn._id}`,
      });
      await employee.save();
      sendPushNotification(
        employee._id,
        `Return Request raised by ${user.userName} for ${existingSite.name}`
      );
    }
    res.status(201).json({ success: true, data: savedReturn });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const saveReturn = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    // console.log(user)
    const returnReq = await Return.findById(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    if (!returnReq)
      return res.status(404).json({ message: "No returnReq Found" });
    const existingSite = await Site.findById(returnReq?.site?.id);
    if (returnReq.createdBy.toString() === user?._id.toString()) {
      if (
        returnReq.adminApprove === "Approved" &&
        returnReq.inchargeApprove === "Approved"
      ) {
        returnReq.approvalStatus = "Approved";
        await returnReq.save();
        existingSite.returnReq.push(returnReq._id);
        await existingSite.save();
        console.log("returnReq:", returnReq);
        return res.status(201).json({ message: "returnReq Saved Successfuly" });
      } else {
        console.log("returnReq is Not Approved By Every One");
        return res
          .status(400)
          .json({ message: "returnReq is Not Approved By Every One" });
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

// Get all returns
const getReturns = async (req, res) => {
  try {
    const returns = await Return.find().populate("site.id").exec(); // Populating the site ID with actual data
    res.status(200).json(returns);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get return by ID
const getReturnById = async (req, res) => {
  try {
    const returnData = await Return.findById(req.params.id)
      .populate("site.id")
      .exec(); // Populating the site ID with actual data
    if (!returnData) {
      return res
        .status(404)
        .json({ success: false, message: "Return not found" });
    }
    res.status(200).json(returnData);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const getReturnItem = async (req, res) => {
  try {
    const returnData = await Return.findById(req.params.id);
    if (!returnData) {
      return res
        .status(404)
        .json({ success: false, message: "Return not found" });
    }
    const data = returnData.returnable;
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a return
const updateReturn = async (req, res) => {
  try {
    const returnId = req.params.id;
    const { materialType, date, returnable, salesInvoiceId } = req.body;

    const existingReturn = await Return.findById(returnId);
    if (!existingReturn) {
      return res.status(404).json({
        success: false,
        message: "Return not found",
      });
    }

    /* ===============================
       STATUS SAFETY
    =============================== */
    if (existingReturn.currentStatus !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only Draft returns can be edited",
      });
    }

    /* ===============================
       BASIC UPDATES
    =============================== */
    if (materialType) existingReturn.materialType = materialType;
    if (date) existingReturn.date = date;

    /* ===============================
       RETURNABLE ITEMS UPDATE
       (Qty only, no name/unit change)
    =============================== */
    if (Array.isArray(returnable)) {
      const updatedItems = [];

      for (const item of returnable) {
        const existingItem = existingReturn.returnable.find(
          (r) => r.item === item.item
        );

        if (!existingItem) continue;

        updatedItems.push({
          ...existingItem.toObject(),
          quantity: Number(item.quantity || existingItem.quantity),
        });
      }

      existingReturn.returnable = updatedItems;
    }

    await existingReturn.save();

    res.status(200).json({
      success: true,
      message: "Return updated successfully",
      data: existingReturn,
    });
  } catch (error) {
    console.error("Update Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateReceived = async (req, res) => {
  try {
    const returnId = req.params.id;
    const { materialType, date, returnable, remarks } = req.body;

    const existingReturn = await Return.findById(returnId);
    if (!existingReturn) {
      return res.status(404).json({
        success: false,
        message: "Return not found",
      });
    }

    /* ===============================
       STATUS SAFETY
    =============================== */
    if (existingReturn.currentStatus !== "Draft") {
      return res.status(400).json({
        success: false,
        message: "Only Draft returns can be edited",
      });
    }

    /* ===============================
       BASIC UPDATES
    =============================== */
    if (materialType) existingReturn.materialType = materialType;
    if (date) existingReturn.date = date;
    if (remarks) existingReturn.remarks = remarks;

    /* ===============================
       RETURNABLE ITEMS UPDATE
       (Qty only, no name/unit change)
    =============================== */
    if (Array.isArray(returnable)) {
      const updatedItems = [];

      for (const item of returnable) {
        const existingItem = existingReturn.returnable.find(
          (r) => r.item === item.item
        );

        if (!existingItem) continue;

        updatedItems.push({
          ...existingItem.toObject(),
          quantity: Number(item.quantity || existingItem.quantity),
          remarks: item.remarks || existingItem.remarks,
        });
      }

      existingReturn.returnable = updatedItems;
    }

    await existingReturn.save();

    res.status(200).json({
      success: true,
      message: "Return updated successfully",
      data: existingReturn,
    });
  } catch (error) {
    console.error("Update Return Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateReturnItem = async (req, res) => {
  try {
    const id = req.params.id;
    const index = req.params.index;
    const existingReturnRequest = await Return.findById(id);
    if (!existingReturnRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Return not found" });
    }
    if (index < 0 || index >= existingReturnRequest.returnable.length) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }
    const { item, quantity, unit } = req.body;
    if (!item || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: "Item, quantity, and unit are required",
      });
    }
    existingReturnRequest.returnable[index] = {
      item: item || existingReturnRequest.returnable[index].item,
      quantity: quantity || existingReturnRequest.returnable[index].quantity,
      unit: unit || existingReturnRequest.returnable[index].unit,
      rate: rate || existingReturnRequest.returnable[index].rate,
      receivedQuantity:
        receivedQuantity ||
        existingReturnRequest.returnable[index].receivedQuantity,
      remarks: remarks || existingReturnRequest.returnable[index].remarks,
    };
    await existingReturnRequest.save();
    res.status(200).json(existingReturnRequest);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a return
const deleteReturn = async (req, res) => {
  try {
    const returnData = await Return.findByIdAndDelete(req.params.id);
    if (!returnData) {
      return res
        .status(404)
        .json({ success: false, message: "Return not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Return deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReturn,
  getReturnById,
  getReturns,
  updateReturn,
  deleteReturn,
  saveReturn,
  getReturnItem,
  updateReturnItem,
};
