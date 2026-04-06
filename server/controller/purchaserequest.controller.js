const mongoose = require("mongoose");
const PurchaseRequest = require("../models/purchaserequest.models");
const Site = require("../models/site.models");
const { Store } = require("../models/store.models");
const {Stock} = require("../models/stock.models");

/* =====================================
   GENERATE PR NUMBER
===================================== */
async function generatePrNumber() {
  const count = await PurchaseRequest.countDocuments();
  const number = String(count + 1).padStart(4, "0");
  const year = new Date().getFullYear();
  return `PR-${year}-${number}`;
}

/* =====================================
   CREATE PR (DRAFT)
===================================== */
const createPurchaseRequest = async (req, res) => {
  try {
    const user = req.user;

    const {
      site,
      store,
      reqDate,
      requirementFor,
      category,
      remarks,
      items,
    } = req.body;

    if (!site) throw new Error("Site is required");
    if (!store) throw new Error("Store is required");
    if (!items || !items.length) throw new Error("Items required");

    const existingSite = await Site.findById(site);
    if (!existingSite) throw new Error("Invalid site");

    const existingStore = await Store.findById(store);
    if (!existingStore) throw new Error("Invalid store");

    /* ===== PROCESS ITEMS ===== */
    const processedItems = [];

    for (const i of items) {
      if (!i.itemId || !i.requestedQty) {
        throw new Error("Invalid item");
      }

      const stock = await Stock.findById(i.itemId);
      if (!stock) throw new Error("Invalid stock item");

      processedItems.push({
        itemId: stock._id,
        unit: stock.unit, // 🔥 auto-fill
        requestedQty: Number(i.requestedQty),
        issuedQty: 0,
      });
    }

    const pr = await PurchaseRequest.create({
      prNumber: await generatePrNumber(),
      createdBy: user._id,

      site,
      store,

      reqDate,
      requirementFor,
      category,
      remarks,

      items: processedItems,

      status: "DRAFT",
      inchargeApprove: "PENDING",
    });

    return res.status(201).json({ success: true, data: pr });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

/* =====================================
   UPDATE PR (ONLY DRAFT)
===================================== */
const updatePurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");

    if (pr.status !== "DRAFT") {
      throw new Error("Only draft PR can be edited");
    }

    const {
      items,
      remarks,
      reqDate,
      category,
      requirementFor,
    } = req.body;

    if (items) {
      const updatedItems = [];

      for (const i of items) {
        if (!i.itemId || !i.requestedQty) {
          throw new Error("Invalid item");
        }

        const stock = await Stock.findById(i.itemId);
        if (!stock) throw new Error("Invalid stock item");

        updatedItems.push({
          itemId: stock._id,
          unit: stock.unit,
          requestedQty: Number(i.requestedQty),
          issuedQty: 0,
        });
      }

      pr.items = updatedItems;
    }

    if (remarks !== undefined) pr.remarks = remarks;
    if (reqDate) pr.reqDate = reqDate;
    if (category) pr.category = category;
    if (requirementFor) pr.requirementFor = requirementFor;

    await pr.save();

    return res.json({ success: true, data: pr });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* =====================================
   SUBMIT PR
===================================== */
const submitPurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");

    if (pr.status !== "DRAFT") {
      throw new Error("Only draft PR can be submitted");
    }

    pr.status = "PENDING";

    await pr.save();

    return res.json({
      success: true,
      message: "PR submitted for approval",
      data: pr,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* =====================================
   APPROVE PR (INCHARGE)
===================================== */
const approvePurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");

    if (pr.status !== "PENDING") {
      throw new Error("PR not in pending state");
    }

    pr.inchargeApprove = "Approved";
    pr.status = "APPROVED";

    await pr.save();

    return res.json({
      success: true,
      message: "PR Approved",
      data: pr,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* =====================================
   REJECT PR
===================================== */
const rejectPurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");

    if (pr.status !== "PENDING") {
      throw new Error("PR not in pending state");
    }

    pr.inchargeApprove = "Rejected";
    pr.status = "REJECTED";

    await pr.save();

    return res.json({
      success: true,
      message: "PR Rejected",
      data: pr,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET OPEN PR (FOR DN)
===================================== */
const getOpenPRForDN = async (req, res) => {
  try {
    const prs = await PurchaseRequest.find({
      status: { $in: ["APPROVED", "PARTIAL"] },
    }).populate("items.itemId");

    return res.json(prs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* =====================================
   GET ALL
===================================== */
const getAllPurchaseRequests = async (req, res) => {
  const data = await PurchaseRequest.find()
    .sort({ createdAt: -1 })
    .populate("site store items.itemId");

  return res.json(data);
};

/* =====================================
   GET BY ID
===================================== */
const getPurchaseRequestById = async (req, res) => {
  const pr = await PurchaseRequest.findById(req.params.id).populate(
    "site store items.itemId"
  );

  if (!pr) return res.status(404).json({ message: "Not found" });

  return res.json(pr);
};

/* =====================================
   DELETE PR (ONLY DRAFT)
===================================== */
const deletePurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");

    if (pr.status !== "DRAFT") {
      throw new Error("Only draft PR can be deleted");
    }

    await pr.deleteOne();

    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET BY SITE
===================================== */
const getPurchaseRequestBySite = async (req, res) => {
  try {
    const prs = await PurchaseRequest.find({
      site: req.params.id,
    }).populate("site store items.itemId");

    return res.json(prs);
  } catch (err) {
    return res.status(500).json({ error: "Error fetching PR for site" });
  }
};

module.exports = {
  createPurchaseRequest,
  updatePurchaseRequest,
  submitPurchaseRequest,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  deletePurchaseRequest,
  getAllPurchaseRequests,
  getPurchaseRequestById,
  getPurchaseRequestBySite,
  getOpenPRForDN,
};