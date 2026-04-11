const Collection = require("../models/collection.models");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");
// const {
//   postVoucher,
//   cancelVoucher,
// } = require("../services/ERP/posting.service.js");
const {
  createVoucher,
  postVoucher,
  cancelVoucher,
} = require("../services/ERP/voucher/voucher.service.js");

/* ---------------- CREATE COLLECTION ENTRY ---------------- */

const createCollection = async (req, res) => {
  try {
    const data = req.body;
    const user = req.user;
    const proofImage = req.file?.path;
    let upload = await uploadOnCloudinary(proofImage, {
      folder: "collections/proofs",
      public_id: `${data.clientLedgerId}-${Date.now()}`,
    });

    const collection = await Collection.create({
      date: data.date,
      companyId: user.companyId,
      businessUnitId: data.businessUnitId,
      costCenterId: data.costCenterId,
      clientLedgerId: data.clientLedgerId,
      receivedInto: data.receivedInto,
      amount: data.amount,

      medium: data.medium,
      referenceNo: data.referenceNo,
      narration: data.narration,
      proofImage: {
        secure_url: upload?.secure_url || null,
        public_id: upload?.public_id || null,
      },
      submittedBy: user?._id, // if auth middleware exists
      status: "pending",
    });
    notifyRole(
      "Employee",
      "Payment Alert",
      `₹ ${data.amount} received for ${data.purpose}`,
      "/",
    );
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET ALL (ACCOUNT SIDE) ---------------- */

const getCollections = async (req, res) => {
  try {
    const list = await Collection.find({
      companyId: req.query.companyId,
    })
      .populate("clientLedgerId")
      .populate("receivedInto")
      .populate("companyId")
      .populate("businessUnitId")
      .populate("costCenterId")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- APPROVE & AUTO CREATE RECEIPT ---------------- */

const postCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);

    if (!collection) throw new Error("Collection not found");

    if (collection.status !== "pending") {
      throw new Error("Already processed");
    }

    // 🔥 CREATE VOUCHER
    const voucher = await createVoucher({
      companyId: collection.companyId,
      type: "RECEIPT",
      date: collection.date,
      narration: collection.narration,

      // businessUnitId: collection.businessUnitId,
      costCenterId: collection.costCenterId,

      reference: "Collection",
      referenceId: collection._id,

      entries: [
        {
          ledgerId: collection.receivedInto,
          type: "DEBIT",
          amount: collection.amount,
        },
        {
          ledgerId: collection.clientLedgerId,
          type: "CREDIT",
          amount: collection.amount,
        },
      ],

      createdBy: req.user._id,
    });

    await postVoucher(voucher._id);

    collection.voucherId = voucher._id;
    collection.status = "approved";

    await collection.save();

    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/* ---------------- REJECT ---------------- */

const rejectCollection = async (req, res) => {
  const { id } = req.params;

  await Collection.findByIdAndUpdate(id, {
    status: "rejected",
  });

  res.json({ message: "Rejected" });
};

const cancelCollection = async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection || !collection.voucherId) {
    throw new Error("Invalid collection");
  }

  await cancelVoucher(collection.voucherId);

  collection.status = "rejected";
  await collection.save();

  res.json({ message: "Cancelled" });
};

const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ error: "Not found" });
    }

    if (collection.status !== "pending") {
      return res.status(400).json({
        error: "Cannot edit approved/rejected collection",
      });
    }

    const data = req.body;

    // optional file update
    let upload = null;
    if (req.file?.path) {
      upload = await uploadOnCloudinary(req.file.path, {
        folder: "collections/proofs",
        public_id: `${collection.clientLedgerId}-${Date.now()}`,
      });
    }

    Object.assign(collection, data);

    if (upload) {
      collection.proofImage = {
        secure_url: upload.secure_url,
        public_id: upload.public_id,
      };
    }

    await collection.save();

    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ error: "Not found" });
    }

    // ✅ CASE 1: Draft → delete directly
    if (collection.status === "pending") {
      await collection.deleteOne();
      return res.json({ message: "Deleted successfully" });
    }

    // ❗ CASE 2: Approved → cancel voucher first
    if (collection.status === "approved") {
      if (!collection.voucherId) {
        return res.status(400).json({
          error: "Voucher missing, cannot delete",
        });
      }

      await cancelVoucher(collection.voucherId);

      await collection.deleteOne();

      return res.json({
        message: "Deleted with voucher cancellation",
      });
    }

    // ❌ rejected (safe to delete)
    await collection.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCollection,
  getCollections,
  postCollection,
  cancelCollection,
  rejectCollection,
  updateCollection,
  deleteCollection
};
