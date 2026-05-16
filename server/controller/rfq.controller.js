const { RFQ, Quotation } = require("../models/rfq.models");
const PurchaseRequest = require("../models/purchaserequest.models");
const { Item } = require("../models/stock.models");
const { Ledger } = require("../models/ledger.models");
const crypto = require("crypto");
const Supplier = require('../models/supplier.models.js');

/* =========================
   GENERATE RFQ NUMBER
========================= */
async function generateRFQNo() {
  const last = await RFQ.findOne().sort({ createdAt: -1 });

  const year = new Date().getFullYear();

  if (!last) return `RFQ-${year}-0001`;

  const lastNumber = parseInt(last.rfqNo.split("-")[2]) || 0;

  return `RFQ-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
}

/* =========================
   CREATE RFQ
========================= */
const createRFQ = async (req, res) => {
  try {
    const {
      purchaseRequestId,
      suppliers,
      quotationDeadline,
      procurementType,
      narration,
    } = req.body;

    if (!purchaseRequestId) {
      throw new Error("PR required");
    }

    if (!suppliers?.length) {
      throw new Error("Suppliers required");
    }

    /* =========================
       CHECK EXISTING RFQ
    ========================== */

    const existing = await RFQ.findOne({
      purchaseRequestId,
      status: {
        $ne: "CANCELLED",
      },
    });

    if (existing) {
      throw new Error(
        "RFQ already exists for this PR"
      );
    }

    /* =========================
       LOAD PR
    ========================== */
    const pr = await PurchaseRequest
      .findById(purchaseRequestId)
      .populate("items.itemId");

    if (!pr) {
      throw new Error("PR not found");
    }

    /* =========================
       VALIDATE SUPPLIERS
    ========================== */

    const supplierDocs =
      await Ledger.find({
        _id: {
          $in: suppliers,
        },

        referenceType: "Supplier",
      });

    if (supplierDocs.length !== suppliers.length) {
      throw new Error(
        "Invalid suppliers"
      );
    }

    /* =========================
       PROCUREMENT ITEMS
    ========================== */
    const procurementItems =
      pr.items.filter((i) => {
        const type =
          i.itemId?.itemType;

        return [
          "MATERIAL",
          "SERVICE",
        ].includes(type);
      });

    if (!procurementItems.length) {
      throw new Error(
        "No procurement items found"
      );
    }

    /* =========================
       RFQ ITEMS
    ========================== */

    const items =
      procurementItems.map((i) => ({
        itemId: i.itemId._id,

        unit: i.unit,

        quantity:
          i.pendingQty,

        lastPurchaseRate:
          i.lastPurchaseRate || 0,

        remarks:
          i.remarks || "",
      }));

    /* =========================
       SUPPLIERS
    ========================== */

    const supplierList =
      suppliers.map(
        (supplierId) => ({
          supplierId,

          accessToken:
            crypto
              .randomBytes(16)
              .toString("hex"),

          expiresAt:
            quotationDeadline ||
            new Date(
              Date.now() +
              7 *
              24 *
              60 *
              60 *
              1000
            ),
        })
      );

    /* =========================
       ESTIMATION
    ========================== */

    const estimatedAmount =
      items.reduce(
        (sum, i) =>
          sum +
          (
            i.quantity *
            (
              i.lastPurchaseRate ||
              0
            )
          ),
        0
      );

    /* =========================
       CREATE RFQ
    ========================== */

    const rfq =
      await RFQ.create({
        rfqNo:
          await generateRFQNo(),

        storeId:
          pr.store,

        purchaseRequestId,

        items,

        suppliers:
          supplierList,

        quotationDeadline,

        procurementType,

        estimatedAmount,

        narration,

        createdBy:
          req.user._id,

        status:
          "DRAFT",
      });

    res.status(201).json({
      success: true,
      data: rfq,
    });

  } catch (err) {
    console.log(err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

/* =========================
   SEND RFQ
========================= */
const sendRFQ = async (req, res) => {
  try {
    const rfq =
      await RFQ.findById(
        req.params.id
      );

    if (!rfq) {
      throw new Error(
        "RFQ not found"
      );
    }

    if (
      rfq.status !==
      "DRAFT"
    ) {
      throw new Error(
        "RFQ already sent"
      );
    }

    rfq.status = "SENT";

    rfq.sentAt =
      new Date();

    await rfq.save();

    res.json({
      success: true,
      data: rfq,
    });

  } catch (err) {
    console.log(err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

/* =========================
   SUBMIT QUOTATION
========================= */
const submitQuotation = async (req, res) => {
  try {
    const { accessToken, items } = req.body;

    const rfq = await RFQ.findOne({
      "suppliers.accessToken": accessToken,
      status: "SENT",
    });

    if (!rfq) throw new Error("Invalid RFQ");

    const supplier = rfq.suppliers.find(
      (s) => s.accessToken === accessToken
    );

    if (!supplier) throw new Error("Supplier not found");

    if (supplier.expiresAt && supplier.expiresAt < new Date()) {
      throw new Error("RFQ expired");
    }

    /* STRICT VALIDATION */
    if (items.length !== rfq.items.length) {
      throw new Error("Incomplete quotation");
    }

    const processedItems = rfq.items.map((rfqItem) => {
      const input = items.find(
        (i) => i.itemId.toString() === rfqItem.itemId.toString()
      );

      if (input.rate <= 0) {
        throw new Error(
          "Invalid rate"
        );
      }

      const varianceAmount =
        rfqItem.lastPurchaseRate
          ? input.rate -
          rfqItem.lastPurchaseRate
          : 0;

      const variancePercentage =
        rfqItem.lastPurchaseRate
          ? Number(
            (
              (
                varianceAmount /
                rfqItem.lastPurchaseRate
              ) * 100
            ).toFixed(2)
          )
          : 0;

      return {
        itemId: rfqItem.itemId,
        quantity: rfqItem.quantity,
        rate: input.rate,
        lastPurchaseRate: rfqItem.lastPurchaseRate,
        varianceAmount,
        variancePercentage
      };
    });

    let quotation;

    try {
      quotation = await Quotation.create({
        rfqId: rfq._id,
        supplierId: supplier.supplierId,
        accessToken,
        items: processedItems,
      });
    } catch (err) {
      if (err.code === 11000) {
        throw new Error("Quotation already submitted");
      }
      throw err;
    }

    res.status(201).json({ success: true, data: quotation });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   GET RFQs
========================= */
const getRFQs = async (req, res) => {
  try {
    const data = await RFQ.find()
      .populate("storeId purchaseRequestId suppliers.supplierId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    console.log(error)
  }
};

const getRFQById = async (req, res) => {
  try {
    const data = await RFQ.findById(req.params.id)
      .populate("storeId purchaseRequestId suppliers.supplierId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    console.log(error)
  }
};

/* =========================
   GET QUOTATIONS
========================= */
const getQuotationById = async (req, res) => {
  try {
    const data = await Quotation.find(req.params.id)
      .populate("supplierId")
      .lean();

    res.json({ success: true, data });
  } catch (error) {
    console.log(error)
  }
};

/* =========================
   COMPARE QUOTATIONS (L1)
========================= */
const compareQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ rfqId: req.params.rfqId });

    const sorted = quotations.sort((a, b) => a.totalAmount - b.totalAmount);

    res.json({
      success: true,
      best: sorted[0],
      all: sorted,
    });
  } catch (error) {
    console.log(error)
  }
};

/* =========================
   SELECT QUOTATION
========================= */
const selectQuotation = async (req, res) => {
  const session =
    await mongoose.startSession();

  session.startTransaction();
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) throw new Error("Quotation not found");

    const rfq = await RFQ.findById(quotation.rfqId);

    if (rfq.status !== "SENT") {
      throw new Error("RFQ closed");
    }

    await Quotation.updateMany(
      { rfqId: rfq._id, _id: { $ne: quotation._id } },
      { status: "REJECTED", isSelected: false }
    );

    quotation.status = "SELECTED";
    quotation.isSelected = true;
    await quotation.save();

    rfq.status = "CLOSED";
    await rfq.save();

    res.json({ success: true, data: quotation });
    await session.commitTransaction();
  } catch (err) {
    res.status(400).json({ error: err.message });
    await session.abortTransaction();
  }
};

/* =========================
   CLOSE RFQ
========================= */
const closeRFQ = async (req, res) => {
  try {
    const rfq =
      await RFQ.findById(
        req.params.id
      );

    if (!rfq) {
      throw new Error(
        "RFQ not found"
      );
    }

    if (
      rfq.status !==
      "SENT"
    ) {
      throw new Error(
        "Only sent RFQ can close"
      );
    }

    rfq.status = "CLOSED";

    await rfq.save();

    res.json({
      success: true,
    });

  } catch (err) {
    console.log(err);

    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  createRFQ,
  sendRFQ,
  getRFQs,
  getRFQById,
  closeRFQ,
  submitQuotation,
  getQuotationById,
  selectQuotation,
  compareQuotations,
};