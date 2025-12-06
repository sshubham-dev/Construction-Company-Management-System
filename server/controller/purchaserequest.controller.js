const PurchaseRequest = require("../models/purchaserequest.models");
const {
  sendApproveByAdmin,
  sendApproveByIncharge,
  sendApproveByAccountHead,
  sendApproveByStoreIncharge,
} = require("./approval.controller.js");
const Site = require("../models/site.models");
const User = require("../models/user.models");
const { sendNotification } = require("./notification.controller.js");

async function generatePrNumber() {
  const count = await PurchaseRequest.countDocuments();
  const number = String(count + 1).padStart(4, "0");
  const year = new Date().getFullYear();
  return `PR-${year}-${number}`;
}

// Create a new purchase request
const createPurchaseRequest = async (req, res) => {
  try {
    const user = req.user; // logged-in user
    const { site, reqDate, requirementFor, category, remarks, items } =
      req.body;

    const existingSite = await Site.findById(site);
    if (!existingSite) return res.status(404).json({ error: "Site not found" });

    const prNumber = await generatePrNumber();

    const newPR = await PurchaseRequest.create({
      prNumber,
      createdBy: user._id,
      site: { id: existingSite._id, name: existingSite.name },
      reqDate,
      requirementFor,
      category,
      remarks,
      items,
    });

    sendApproveByAdmin(newPR, "Purchase Request", user._id);
    sendApproveByStoreIncharge(newPR, "Purchase Request", user._id);
    sendApproveByAccountHead(newPR, "Purchase Request", user._id);
    sendApproveByIncharge(newPR, "Purchase Request", user._id);

    // Notify employees
    const employees = await User.find({ role: "Employee" });
    const creator = await User.findById(user._id).select("userName");

    for (const employee of employees) {
      employee.notification.push({
        title: "Purchase Request Alert",
        message: `New PR created by ${creator.userName} for ${requirementFor} at ${existingSite.name}`,
        link: `/purchase-request/${newPR._id}`,
        createdAt: new Date(),
      });
      await employee.save();
      sendNotification(
        employee.userId,
        `${user.userName} has raised Purchase request for ${existingSite.name}`
      );
    }

    res.status(201).json({
      message: "Purchase Request created",
      pr: newPR,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error creating purchase request" });
  }
};

const savePurchaserequest = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    // console.log(user)
    const purchaseRequest = await PurchaseRequest.findById(id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    if (!purchaseRequest)
      return res.status(404).json({ message: "No purchaseRequest Found" });
    const existingSite = await Site.findById(purchaseRequest?.site?.id);
    if (purchaseRequest.createdBy.toString() === user?._id.toString()) {
      if (
        purchaseRequest.adminApprove === "Approved" &&
        purchaseRequest.storeApprove === "Approved" &&
        purchaseRequest.accountsApprove === "Approved" &&
        purchaseRequest.inchargeApprove === "Approved"
      ) {
        purchaseRequest.approvalStatus = "Approved";
        await purchaseRequest.save();
        existingSite.purchaseRequest.push(purchaseRequest._id);
        await existingSite.save();
        console.log("purchaseRequest:", purchaseRequest);
        const employees = await User.find({ role: "Employee" });

        for (const employee of employees) {
          employee.notification.push({
            title: "Purchase Request Alert",
            message: `Purchase Request for ${purchaseRequest.requirementFor} on ${existingSite.name} has been approved by all authorities`,
            createdAt: purchaseRequest.createdAt
              ? purchaseRequest.createdAt
              : new Date(),
            link: `/purchase-request/${purchaseRequest._id}`,
          });
          await employee.save();
        }
        return res
          .status(201)
          .json({ message: "purchaseRequest Saved Successfuly" });
      } else {
        console.log("purchaseRequest is Not Approved By Every One");
        return res
          .status(400)
          .json({ message: "purchaseRequest is Not Approved By Every One" });
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

// Get all purchase requests
const getAllPurchaseRequests = async (req, res) => {
  try {
    const prs = await PurchaseRequest.find()
      .populate("site.id")
      .sort({ createdAt: -1 });

    res.json(prs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching PR list" });
  }
};

// Get a specific purchase request by ID
const getPurchaseRequestById = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id)
      .populate("site.id")
      .populate("items.itemId");

    if (!pr) return res.status(404).json({ error: "PR not found" });

    res.json(pr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching PR" });
  }
};

// Get a specific purchase request by ID
const getPurchaseRequestBySite = async (req, res) => {
  try {
    const prs = await PurchaseRequest.find({
      "site.id": req.params.id,
    }).populate("site.id");

    res.json(prs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching PR for site" });
  }
};

// Update a purchase request
const updatePurchaseRequest = async (req, res) => {
  try {
    const { site, reqDate, requirementFor, category, remarks, items } =
      req.body;
    console.log("req", req.body);

    const pr = await PurchaseRequest.findById(req.params.id);
    if (!pr) return res.status(404).json({ error: "PR not found" });

    if (pr.approvalStatus !== "Pending")
      return res.status(400).json({ error: "PR already processed" });

    if (site) {
      const existingSite = await Site.findById(site);
      pr.site = { id: existingSite._id, name: existingSite.name };
    }

    pr.reqDate = reqDate || pr.reqDate;
    pr.requirementFor = requirementFor || pr.requirementFor;
    pr.category = category || pr.category;
    pr.remarks = remarks || pr.remarks;

    // FIXED: correctly add items
    if (items && Array.isArray(items)) {
      pr.items = [...pr.items, ...items];
    }

    await pr.save();
    res.json({ message: "PR updated", pr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating PR" });
  }
};

const updatePurchaseRequirement = async (req, res) => {
  try {
    const id = req.params.id;
    const index = req.params.index;
    const { itemId, item, unit, requestedQty } = req.body;

    const existingPurchaseRequest = await PurchaseRequest.findById(id);
    if (!existingPurchaseRequest) {
      return res.status(404).json({ error: "Purchase request not found" });
    }

    if (index < 0 || index >= existingPurchaseRequest.items.length) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }
    if (!item) {
      return res.status(400).json({ success: false, message: "Item" });
    }
    existingPurchaseRequest.items[index] = {
      itemId: itemId || existingPurchaseRequest.items[index].itemId,
      item: item || existingPurchaseRequest.items[index].item,
      requestedQty:
        requestedQty || existingPurchaseRequest.items[index].requestedQty,
      unit: unit || existingPurchaseRequest.items[index].unit,
    };
    await existingPurchaseRequest.save();
    res.status(200).json(existingPurchaseRequest);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error updating purchase request" });
  }
};

// Delete a purchase request
const deletePurchaseRequest = async (req, res) => {
  try {
    const deleted = await PurchaseRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "PR not found" });

    res.json({ message: "PR deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting PR" });
  }
};

module.exports = {
  getAllPurchaseRequests,
  getPurchaseRequestById,
  getPurchaseRequestBySite,
  createPurchaseRequest,
  updatePurchaseRequest,
  deletePurchaseRequest,
  savePurchaserequest,
  updatePurchaseRequirement,
};
