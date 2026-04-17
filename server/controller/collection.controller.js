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
    console.log(data);
    const user = req.user;
    const proofImage = req.file?.path;
    let upload;
    if (proofImage) {
      upload = await uploadOnCloudinary(proofImage, {
        folder: "collections/proofs",
        public_id: `${data.clientLedgerId}-${Date.now()}`,
      });
    }

    const collection = await Collection({
      date: data.date,
      companyId: user.companyId,
      businessUnitId: user.businessUnitId,
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

    const newCollection = await collection.save();

    notifyRole(
      "Employee",
      "Payment Alert",
      `₹ ${data.amount} received for ${data.narration}`,
      "/",
    );
    res.status(201).json(newCollection);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET ALL (ACCOUNT SIDE) ---------------- */

const getCollections = async (req, res) => {
  try {
    const {
      companyId,
      page = 1,
      limit = 10,
      search = "",
      status,
      date,

      // ✅ advanced filters
      fromDate,
      toDate,
      bank,
      costCenter,
      businessUnit,
    } = req.query;

    const skip = (page - 1) * limit;

    /* ---------------- BASE FILTER ---------------- */
    // const filter = {
    //   companyId,
    // };
    const filter = {};

    /* ---------------- STATUS ---------------- */
    if (status) {
      filter.status = status;
    }

    /* ---------------- QUICK DATE FILTER ---------------- */
    if (date && !fromDate && !toDate) {
      const now = new Date();

      if (date === "today") {
        filter.date = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
        };
      }

      if (date === "week") {
        const firstDay = new Date();
        firstDay.setDate(now.getDate() - 7);

        filter.date = { $gte: firstDay };
      }

      if (date === "month") {
        const firstDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

        filter.date = { $gte: firstDay };
      }
    }

    /* ---------------- CUSTOM DATE RANGE ---------------- */
    if (fromDate || toDate) {
      filter.date = {};

      if (fromDate) {
        filter.date.$gte = new Date(fromDate);
      }

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999); // full day
        filter.date.$lte = end;
      }
    }

    /* ---------------- ADVANCED FILTERS ---------------- */
    // if (bank) {
    //   filter.receivedInto = bank;
    // }

    // if (costCenter) {
    //   filter.costCenterId = costCenter;
    // }

    // if (businessUnit) {
    //   filter.businessUnitId = businessUnit;
    // }

    /* ---------------- SEARCH ---------------- */
    if (search) {
      filter.$or = [
        { purpose: { $regex: search, $options: "i" } },
        { narration: { $regex: search, $options: "i" } },
      ];
    }

    /* ---------------- QUERY ---------------- */
    const [data, total] = await Promise.all([
      Collection.find(filter)
        .populate("clientLedgerId", "name")
        .populate("receivedInto", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(), // ✅ performance boost

      Collection.countDocuments(filter),
    ]);

    /* ---------------- RESPONSE ---------------- */
    res.json({
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const getCollection = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const list = await Collection.findById(id)
      .populate("clientLedgerId")
      .populate("receivedInto")
      .populate("companyId")
      .populate("businessUnitId")
      .populate("costCenterId");

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
    const user = req.user;

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
    collection.receivedInto = data.receivedInto;
    collection.companyId = user.companyId;
    collection.businessUnitId = user.businessUnitId

    if (upload) {
      collection.proofImage = {
        secure_url: upload.secure_url,
        public_id: upload.public_id,
      };
    }

    await collection.save();

    res.json(collection);
  } catch (err) {
    console.log(err);
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
  deleteCollection,
  getCollection,
};
