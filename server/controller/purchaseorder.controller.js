const PurchaseOrder = require("../models/purchaseOrder.models");
const Supplier = require("../models/supplier.models");
const {
  sendApproveByAdmin,
  sendApproveBySupplier,
  sendApproveByAccountHead,
} = require("./approval.controller");

const { sendPushNotification } = require("../utils/pushNotification");
const { RFQ, Quotation } = require("../models/rfq.models");
const { Ledger } = require("../models/ledger.models");
const {
  Store,
} = require("../models/store.models");


async function generatePONumber() {
  const last = await PurchaseOrder.findOne().sort({ createdAt: -1 });

  const year = new Date().getFullYear();

  if (!last) return `PO-${year}-0001`;

  const lastNumber = parseInt(last.poNo.split("-")[2]) || 0;

  return `PO-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
}


/* =====================================
   CREATE PO (DRAFT)
===================================== */
const createPurchaseOrder = async (req, res) => {
  try {
    const { quotationId, deliveryType, storeId, siteId, narration } = req.body;
    const quotation = await Quotation.findById(quotationId);
    if (!quotation || !quotation.isSelected) {
      throw new Error("Invalid quotation");
    }

    const rfq = await RFQ.findById(quotation.rfqId);

    const supplier = await Ledger.findById(quotation.supplierId);
    if (!supplier) throw new Error("Invalid supplier");

    /* DELIVERY VALIDATION */
    if (deliveryType === "STORE" && !storeId)
      throw new Error("Store required");

    if (deliveryType === "SITE" && !siteId)
      throw new Error("Site required");

    /* ITEMS */
    const items = quotation.items.map(i => {
      const rfqItem = rfq.items.find(r =>
        r.itemId.toString() === i.itemId.toString()
      );

      return {
        itemId: i.itemId,
        unit: rfqItem?.unit || "NOS",
        quantity: i.quantity,
        rate: i.rate,
        amount: i.quantity * i.rate,
      };
    });

    const totalAmount = items.reduce((a, i) => a + i.amount, 0);

    const po = await PurchaseOrder.create({
      poNo: await generatePONumber(),
      supplierId: supplier._id,
      deliveryType,
      storeId,
      siteId,
      rfqId: rfq._id,
      quotationId: quotation._id,
      purchaseRequestId: rfq.purchaseRequestId,
      items,
      totalAmount,
      createdBy: req.user._id,
      narration,
    });

    res.status(201).json({ success: true, data: po });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   UPDATE PO (ONLY DRAFT)
===================================== */
const updatePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po || po.status !== "DRAFT") {
      throw new Error("Only draft editable");
    }

    const { items, narration } = req.body;

    if (items) {
      po.items = items.map(i => ({
        itemId: i.itemId,
        unit: i.unit,
        quantity: Number(i.quantity),
        rate: Number(i.rate),
        amount: i.quantity * i.rate,
      }));

      po.totalAmount = po.items.reduce((a, i) => a + i.amount, 0);
    }

    if (narration !== undefined) po.narration = narration;

    await po.save();

    res.json({ success: true, data: po });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   APPROVE PO (FINAL LOCK)
===================================== */
const orderPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po || po.status !== "DRAFT") {
      throw new Error("Invalid state");
    }

    po.status = "ORDERED";
    po.approvedBy = req.user._id;
    po.approvedAt = new Date();

    await po.save();

    res.json({ success: true, data: po });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET ALL APPROVED PO
===================================== */
const getPurchaseOrders = async (req, res) => {
  const data = await PurchaseOrder.find()
    .populate("supplierId storeId siteId")
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
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

const cancelPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) throw new Error("PO not found");
    if (po.status === "COMPLETED") {
      throw new Error("Cannot cancel completed PO");
    }

    po.status = "CANCELLED";
    await po.save();

    res.json({ success: true });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getOpenPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find({
      status: { $in: ["ORDERED", "PARTIAL"] },
    });

    const data = pos.map(po => ({
      ...po.toObject(),
      items: po.items
        .map(i => {
          const pendingQty = i.quantity - i.receivedQty;
          if (pendingQty <= 0) return null;

          return { ...i.toObject(), pendingQty };
        })
        .filter(Boolean),
    }));

    res.json({ success: true, data });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


module.exports = {
  getPurchaseOrder,
  getPurchaseOrders,
  getOpenPurchaseOrders,
  sitePurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,


  getRequirements,
  updateRequirement,
  deleteRequirement,
  draftPurchaseOrders,
};
