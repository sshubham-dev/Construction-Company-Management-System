const mongoose = require("mongoose");
const Collection = require("../models/collection.models");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const {
  sendPushNotification,
  notifyRole,
} = require("../utils/pushNotification.js");
const {
  createVoucher,
  postVoucher,
  cancelVoucher,
} = require("../services/ERP/voucher/voucher.service.js");
const getFinancialYear = require("../utils/getFinancialYear.js");
const { generateVoucherNo } = require("../utils/voucherNoGenerator.js");
const { getCollectionDashboard } = require("../services/ERP/collection.service.js")

/* ---------------- CREATE COLLECTION ENTRY ---------------- */

const createCollection = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const user = req.user;
    let upload = null;
    if (req.file?.buffer) {
      upload = await uploadOnCloudinary(req.file.buffer, {
        folder: "collections",
        public_id: `${data.clientLedgerId}-${Date.now()}`,
      });
      if (!upload) return res.status(404).json({ message: "Some thing went wrong!" })
      console.log("File uploaded to Cloudinary:", upload);
    }

    const collection = await Collection({
      date: data.date,
      settlementTo: data.settlementTo,
      companyId: user.companyId,
      businessUnitId: user.businessUnitId,
      departmentId: data.departmentId,
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

const CollectionDashboard = async (req, res) => {
  try {
    const {
      companyId,
      fromDate,
      toDate,
      departmentId,
      businessUnitId,
      costCenterId,
    } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company Id is required",
      });
    }

    const data = await getCollectionDashboard({
      companyId,
      fromDate,
      toDate,
      departmentId,
      businessUnitId,
      costCenterId,
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Collection Dashboard:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const getCollections = async (req, res) => {
  try {
    const {
      companyId,
      page = 1,
      limit = 10,
      search = "",
      status,
      date,

      fromDate,
      toDate,
      bank,
      costCenter,
      businessUnit,
      minAmount,
      maxAmount,
    } = req.query;

    const skip = (page - 1) * limit;

    const matchStage = {
      companyId: new mongoose.Types.ObjectId(companyId),
    };

    /* ---------------- STATUS ---------------- */
    if (status) matchStage.status = status;

    /* ---------------- DATE FILTER ---------------- */
    if (date && !fromDate && !toDate) {
      const now = new Date();

      if (date === "today") {
        matchStage.date = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
        };
      }

      if (date === "week") {
        const firstDay = new Date();
        firstDay.setDate(now.getDate() - 7);
        matchStage.date = { $gte: firstDay };
      }

      if (date === "month") {
        matchStage.date = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        };
      }
    }

    if (fromDate || toDate) {
      matchStage.date = {};

      if (fromDate) matchStage.date.$gte = new Date(fromDate);

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        matchStage.date.$lte = end;
      }
    }

    /* ---------------- EXACT FILTERS ---------------- */
    if (bank) matchStage.receivedInto = new mongoose.Types.ObjectId(bank);
    if (costCenter)
      matchStage.costCenterId = new mongoose.Types.ObjectId(costCenter);
    if (businessUnit)
      matchStage.businessUnitId = new mongoose.Types.ObjectId(businessUnit);

    /* ---------------- PIPELINE ---------------- */
    const pipeline = [
      { $match: matchStage },

      /* ---- JOIN CLIENT ---- */
      {
        $lookup: {
          from: "ledgers",
          localField: "clientLedgerId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: "$client" },

      /* ---- JOIN RECEIVED INTO ---- */
      {
        $lookup: {
          from: "ledgers",
          localField: "receivedInto",
          foreignField: "_id",
          as: "received",
        },
      },
      { $unwind: "$received" },

      /* ---- JOIN COST CENTER ---- */
      {
        $lookup: {
          from: "costcenters",
          localField: "costCenterId",
          foreignField: "_id",
          as: "costCenter",
        },
      },
      {
        $unwind: {
          path: "$costCenter",
          preserveNullAndEmptyArrays: true,
        },
      },
      /* ---- JOIN DEPARTMENT ---- */
      {
        $lookup: {
          from: "costcenters",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    /* ---------------- SEARCH ---------------- */
    if (search) {
      const isNumber = !isNaN(Number(search));

      pipeline.push({
        $match: {
          $or: [
            { "client.name": { $regex: search, $options: "i" } },
            { "costCenter.name": { $regex: search, $options: "i" } },
            { purpose: { $regex: search, $options: "i" } },
            { narration: { $regex: search, $options: "i" } },
            ...(isNumber ? [{ amount: Number(search) }] : []),
          ],
        },
      });
    }

    /* ---------------- AMOUNT RANGE ---------------- */
    if (minAmount || maxAmount) {
      pipeline.push({
        $match: {
          amount: {
            ...(minAmount && { $gte: Number(minAmount) }),
            ...(maxAmount && { $lte: Number(maxAmount) }),
          },
        },
      });
    }

    /* ---------------- PAGINATION ---------------- */
    const dataPipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ];

    const countPipeline = [...pipeline, { $count: "total" }];

    const [data, countResult] = await Promise.all([
      Collection.aggregate(dataPipeline),
      Collection.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

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
      .populate("costCenterId")
      .populate("departmentId");

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
      type: "RECEIPT",
      date: collection.date,
      companyId: collection.companyId,
      narration: collection.narration,
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
      status: "DRAFT",
      createdBy: req.user._id,
    });

    collection.voucherId = voucher._id;
    collection.status = "approved";

    await collection.save();

    res.json(collection);
  } catch (err) {
    console.log(err)
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
    if (req.file?.buffer) {
      upload = await uploadOnCloudinary(req.file?.buffer, {
        folder: "collections",
        public_id: `${collection.clientLedgerId}-${Date.now()}`,
      });
      if (!upload) return res.status(404).json({ message: "Some thing went wrong!" })
      console.log("File uploaded to Cloudinary:", upload);
    }

    Object.assign(collection, data);
    collection.receivedInto = data.receivedInto;
    collection.companyId = user.companyId;
    collection.businessUnitId = user.businessUnitId
    collection.costCenterId = data.costCenterId;
    collection.departmentId = data.departmentId;
    collection.settlementTo = data.settlementTo;

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
  CollectionDashboard,
};
