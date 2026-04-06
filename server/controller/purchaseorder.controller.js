const PurchaseOrder = require("../models/purchaseOrder.models");
const Supplier = require("../models/supplier.models");
const {
  sendApproveByAdmin,
  sendApproveBySupplier,
  sendApproveByAccountHead,
} = require("./approval.controller");

const { sendPushNotification } = require("../utils/pushNotification");

/* =====================================
   CREATE PO (DRAFT)
===================================== */
const createPurchaseOrder = async (req, res) => {
  try {
    const user = req.user;

    const { supplier, deliveryFor, items, remarks } = req.body;

    if (!items || !items.length) {
      throw new Error("Items required");
    }

    const existingSupplier = await Supplier.findById(supplier.id);
    if (!supplier) throw new Error("Invalid supplier");

    /* ===== VALIDATE ITEMS ===== */
    const processedItems = items.map((i) => {
      if (!i.itemId || !i.requestedQty) {
        throw new Error("Invalid item data");
      }

      return {
        itemId: i.itemId,
        item: i.item,
        unit: i.unit,
        requestedQty: Number(i.requestedQty),
        rate: Number(i.rate),
        gstRate: Number(i.gstRate || 0),
        receivedQty: 0,
        invoicedQty: 0,
      };
    });

    const po = await PurchaseOrder.create({
      supplier: {
        id: existingSupplier._id,
        name: existingSupplier.name,
      },

      deliveryFor,

      items: processedItems,

      createdBy: user._id,
      remarks,

      commercialApprovalStatus: "Pending",
      accountHeadApproval: "Pending",
      finalApprovalStatus: "Pending",
    });

    /* ===== APPROVAL FLOW ===== */
    sendApproveByAdmin(po, "Purchase Order", user._id);
    sendApproveByAccountHead(po, "Purchase Order", user._id);

    res.status(201).json({
      success: true,
      data: po,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   UPDATE PO (ONLY DRAFT)
===================================== */
const updatePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) throw new Error("PO not found");

    if (po.finalApprovalStatus !== "Pending") {
      throw new Error("Approved PO cannot be edited");
    }

    const { items, remarks } = req.body;

    if (items) {
      po.items = items.map((i) => ({
        ...i,
        requestedQty: Number(i.requestedQty),
        rate: Number(i.rate),
      }));
    }

    if (remarks) po.remarks = remarks;

    await po.save();

    res.json({ success: true, data: po });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   APPROVE PO (FINAL LOCK)
===================================== */
const approvePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) throw new Error("PO not found");

    if (
      po.commercialApprovalStatus !== "Approved" ||
      po.accountHeadApproval !== "Approved"
    ) {
      throw new Error("PO not fully approved");
    }

    po.finalApprovalStatus = "Approved";

    await po.save();

    res.json({
      success: true,
      message: "PO Approved",
      data: po,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET ALL APPROVED PO
===================================== */
const getPurchaseOrders = async (req, res) => {
  const data = await PurchaseOrder.find({
    finalApprovalStatus: "Approved",
  }).sort({ createdAt: -1 });

  res.json(data);
};

/* =====================================
   GET BY ID
===================================== */
const getPurchaseOrder = async (req, res) => {
  const po = await PurchaseOrder.findById(req.params.id);

  if (!po) return res.status(404).json({ message: "Not found" });

  res.json(po);
};

/* =====================================
   DELETE (ONLY DRAFT)
===================================== */
const deletePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) throw new Error("PO not found");

    if (po.finalApprovalStatus !== "Pending") {
      throw new Error("Approved PO cannot be deleted");
    }

    await po.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const draftPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().sort({ createdAt: -1 });
    if (!purchaseOrders && purchaseOrders.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const sitePurchaseOrders = async (req, res) => {
  try {
    const id = req.params.id;
    const purchaseOrders = await PurchaseOrder.find()
      .where("adminApprove")
      .equals("Approved")
      .where("approvalStatus")
      .equals("Approved")
      .where("site")
      .equals(id)
      .exec();
    if (!purchaseOrders && purchaseOrders.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    const approvedOrders = purchaseOrders.filter(
      (purchaseOrder) => purchaseOrder.approvalStatus === "Approved",
    );
    res.status(200).json(approvedOrders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getRequirements = async (req, res) => {
  try {
    const _id = req.params.id;
    const purchaseOrder = await PurchaseOrder.findById(_id);

    if (!purchaseOrder && purchaseOrder.requirement.length === 0) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    const requirement = purchaseOrder.requirement;
    return res.status(200).json({ requirement, purchaseOrder });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const updateRequirement = async (req, res) => {
  try {
    const _id = req.params.id;
    const index = req.params.index;
    const user = req.user;
    const { material, rate, quantity, amount, unit, status } = req.body;
    const purchaseOrder = await PurchaseOrder.findById(_id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    console.log(req.body);
    const Amount = parseFloat(amount);
    purchaseOrder.requirement[index] = {
      material,
      rate,
      quantity,
      amount: Amount,
      unit,
      status,
    };

    await purchaseOrder.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ message: "Requirement Detail Updated Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteRequirement = async (req, res) => {
  try {
    const _id = req.params.id;
    const index = req.params.index;
    const user = req.user;
    const purchaseOrder = await PurchaseOrder.findById(_id)
      .where("createdBy")
      .equals(user?._id)
      .exec();
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    purchaseOrder.requirement.splice(index, 1);
    await purchaseOrder.save();
    const requirement = purchaseOrder.requirement;
    res
      .status(201)
      .json({
        message: "Work Detail Deleted Successfully",
        requirement,
        purchaseOrder,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};


const getOpenPurchaseOrders = async (req, res) => {
  try {
    const { store, supplier } = req.query;

    const query = {};

    /* =========================
       FILTER: STORE
    ========================== */
    if (store) {
      query["deliveryTo"] = "Store";
      query["deliveryFor.id"] = store;
    }

    /* =========================
       FILTER: SUPPLIER
    ========================== */
    if (supplier) {
      query["supplier.id"] = supplier;
    }

    /* =========================
       ONLY APPROVED PO
    ========================== */
    // query.finalApprovalStatus = "Approved";
console.log(query)
    /* =========================
       FETCH
    ========================== */
    const pos = await PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .lean();

    /* =========================
       FILTER OPEN ITEMS
    ========================== */
    const openPOs = pos
      .map((po) => {
        const openItems = po.items
          .map((item) => {
            const pendingQty =
              (item.requestedQty || 0) - (item.receivedQty || 0);

            if (pendingQty <= 0) return null;

            return {
              ...item,
              pendingQty,
            };
          })
          .filter(Boolean);

        if (!openItems.length) return null;

        return {
          ...po,
          items: openItems,
        };
      })
      .filter(Boolean);

    res.json(openPOs);
  } catch (err) {
    console.error("Open PO Error:", err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getPurchaseOrder,
  getPurchaseOrders,
  sitePurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getRequirements,
  updateRequirement,
  deleteRequirement,
  draftPurchaseOrders,
  approvePurchaseOrder,
  getOpenPurchaseOrders,
};
