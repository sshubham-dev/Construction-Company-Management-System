const Collection = require("../models/collection.models");
const Receipt = require("../models/receipt.models"); // your existing receipt model
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");
/* ---------------- CREATE COLLECTION ENTRY ---------------- */

const createCollection = async (req, res) => {
  try {
    const data = req.body;
    const proofImage = req.file?.path;
    let upload = await uploadOnCloudinary(proofImage, {
      folder: "collections/proofs",
      public_id: `${data.clientLedgerId}-${Date.now()}`,
    });

    const collection = await Collection.create({
      date: data.date,
      clientLedgerId: data.clientLedgerId,
      receivedInto: data.receivedInto,
      amount: data.amount,
      purpose: data.purpose,
      medium: data.medium,
      referenceNo: data.referenceNo,
      narration: data.narration,
      proofImage: {
        secure_url: upload?.secure_url || null,
        public_id: upload?.public_id || null,
      },
      submittedBy: req.user?._id, // if auth middleware exists
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
  const list = await Collection.find()
    .populate("clientLedgerId")
    .populate("receivedInto")
    .sort({ createdAt: -1 });

  res.json(list);
};

/* ---------------- APPROVE & AUTO CREATE RECEIPT ---------------- */

const approveCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findById(id);

    if (!collection) return res.status(404).json({ message: "Not found" });

    if (collection.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    /* --- CREATE REAL RECEIPT VOUCHER --- */
    const receipt = await Receipt.create({
      date: collection.date,
      fromLedgerId: collection.clientLedgerId,
      toLedgerId: collection.receivedInto,
      amount: collection.amount,
      referenceNo: collection.referenceNo,
      description: collection.narration,
      purpose: collection.purpose,
    });

    collection.status = "approved";
    await collection.save();

    res.json({ message: "Approved", receipt });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

module.exports = {
  createCollection,
  getCollections,
  approveCollection,
  rejectCollection,
};
