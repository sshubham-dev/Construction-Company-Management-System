const { RFQ, Quotation } = require("../models/rfq.models");
const PurchaseRequest = require("../models/purchaserequest.models");
const { Item } = require("../models/stock.models");
const { Ledger } = require("../models/ledger.models");
const Supplier = require('../models/supplier.models.js');
const {
  generateRFQToken,
  generateSupplierRFQLink,
  generateRFQShareMessage,
} = require("../utils/rfq.utils");

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

    const items = procurementItems.map((i) => ({
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
       ESTIMATION
    ========================== */

    const estimatedAmount = items.reduce(
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

    const rfq = await RFQ.create({
      rfqNo:
        await generateRFQNo(),

      storeId:
        pr.store,

      purchaseRequestId,

      items,

      suppliers: suppliers.map(
        (supplierId) => ({
          supplierId,
        })
      ),

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
      )

        .populate(
          "suppliers.supplierId"
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
        "Only draft RFQ can send"
      );
    }

    /* =========================
       GENERATE TOKENS
    ========================== */

    rfq.suppliers =
      rfq.suppliers.map(
        (supplier) => {

          if (
            !supplier.accessToken
          ) {
            supplier.accessToken =
              generateRFQToken();
          }

          if (
            !supplier.expiresAt
          ) {
            supplier.expiresAt =
              new Date(
                Date.now() +
                7 *
                24 *
                60 *
                60 *
                1000
              );
          }

          return supplier;
        }
      );

    /* =========================
       STATUS
    ========================== */

    rfq.status =
      "REQUESTED";

    rfq.requestedAt =
      new Date();

    await rfq.save();

    /* =========================
       SHARE DATA
    ========================== */

    const shareData =
      rfq.suppliers.map(
        (supplier) => {

          const link =
            generateSupplierRFQLink(
              supplier.accessToken
            );

          return {
            supplierId:
              supplier
                .supplierId
                ?._id,

            supplierName:
              supplier
                .supplierId
                ?.name,

            phone:
              supplier
                .supplierId
                ?.phone,

            email:
              supplier
                .supplierId
                ?.email,

            link,

            message:
              generateRFQShareMessage({
                supplierName:
                  supplier
                    .supplierId
                    ?.name,

                rfqNo:
                  rfq.rfqNo,

                link,

                deadline:
                  rfq.quotationDeadline
                    ?.toDateString(),
              }),
          };
        }
      );

    res.json({
      success: true,

      message:
        "RFQ sent successfully",

      data: {
        rfq,
        suppliers:
          shareData,
      },
    });

  } catch (err) {

    console.log(err);

    res.status(400).json({
      success: false,
      error:
        err.message,
    });
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

const getVendorRFQ = async (req, res) => {
  try {

    const { token } =
      req.params;

    const rfq = await RFQ.findOne({
      "suppliers.accessToken":
        token,
    })
      .populate({
        path: "items.itemId",

        populate: [
          {
            path:
              "categoryId",
          },
        ],
      })
      .populate(
        "purchaseRequestId storeId"
      )
      .populate({
        path:
          "suppliers.supplierId",

        select:
          "name mobile email",
      });

    if (!rfq) {
      throw new Error(
        "Invalid RFQ"
      );
    }

    const supplier = rfq.suppliers.find(
      (s) =>
        s.accessToken ===
        token
    );

    if (!supplier) {
      throw new Error(
        "Invalid supplier"
      );
    }

    if (supplier.expiresAt < new Date()) {
      throw new Error(
        "RFQ expired"
      );
    }

    if (!["REQUESTED", "QUOTED"].includes(rfq.status)) {
      throw new Error(
        "RFQ not available"
      );
    }

    const existingQuotation = await Quotation.findOne({
      rfqId: rfq._id,
      supplierId:
        supplier.supplierId,
    });

    res.json({
      success: true,

      data: {
        rfq,
        supplier,
        alreadySubmitted: !!existingQuotation,
      },
    });

  } catch (err) {

    console.log(err);

    res.status(400).json({
      success: false,
      error:
        err.message,
    });
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
   SUBMIT QUOTATION
========================= */
const submitQuotation = async (req, res) => {
  try {
    const { accessToken, items, freightAmount } = req.body;

    const rfq = await RFQ.findOne({
      "suppliers.accessToken":
        accessToken,

      status: {
        $in: [
          "REQUESTED",
          "QUOTED",
        ],
      },
    });

    if (!rfq) throw new Error("Invalid RFQ");
    if (rfq.status === "CLOSED") {
      throw new Error("RFQ closed");
    }

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

    const existingQuotation =
      await Quotation.findOne({
        rfqId: rfq._id,

        supplierId:
          supplier.supplierId,
      });

    if (existingQuotation) {
      throw new Error(
        "Quotation already submitted"
      );
    }

    const quotation = await Quotation.create({
      rfqId: rfq._id,
      supplierId: supplier.supplierId,
      accessToken,
      items: processedItems,
      freightAmount,
    });

    rfq.status = "QUOTED";
    await rfq.save();

    res.status(201).json({ success: true, data: quotation });

  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

/* =========================
   COMPARE QUOTATIONS (L1)
========================= */
const compareQuotations = async (req, res) => {

  try {

    const quotations = await Quotation.find({
      rfqId:
        req.params.id,
    })
      .populate("supplierId", `name mobile`)
      .populate({
        path: "items.itemId",
        select: `
              name
              code
            `,
      });

    if (!quotations.length) {
      throw new Error(
        "No quotations found"
      );
    }

    const rfq = await RFQ.findById(
      req.params.id
    ).populate("purchaseRequestId");

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    /* =====================
       TOTAL CALCULATION
    ===================== */

    const processed = quotations.map(
      (quotation) => {

        const itemTotal = quotation.items.reduce(
          (
            sum,
            item
          ) =>
            sum +
            (
              item.quantity *
              item.rate
            ),
          0
        );

        const totalAmount = itemTotal + (quotation.freightAmount || 0);

        return {
          ...quotation.toObject(),
          totalAmount,
        };
      }
    );

    /* =====================
       SORT L1
    ===================== */

    processed.sort(
      (a, b) =>
        a.totalAmount -
        b.totalAmount
    );

    /* =====================
       RANKING
    ===================== */

    const ranked = processed.map(
      (
        quotation,
        index
      ) => ({
        ...quotation,

        rank:
          `L${index + 1}`,
      })
    );

    res.json({
      success: true,

      best:
        ranked[0],

      all:
        ranked,
        rfq,
    });

  } catch (err) {

    console.log(err);

    res.status(400).json({
      success: false,
      error:
        err.message,
    });
  }
};

/* =========================
   SELECT QUOTATION
========================= */
const selectQuotation = async (req, res) => {

  const session =
    await mongoose.startSession();

  try {

    session.startTransaction();

    /* =====================
       QUOTATION
    ===================== */

    const quotation = await Quotation.findById(req.params.id).session(session);

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    /* =====================
       RFQ
    ===================== */

    const rfq = await RFQ.findById(quotation.rfqId).session(session);

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq.status === "CLOSED") {
      throw new Error("RFQ already closed");
    }

    /* =====================
       REJECT OTHERS
    ===================== */

    await Quotation.updateMany(
      {
        rfqId:
          rfq._id,

        _id: {
          $ne:
            quotation._id,
        },
      },

      {
        status:
          "REJECTED",

        isSelected:
          false,
      },

      { session }
    );

    /* =====================
       SELECT CURRENT
    ===================== */

    quotation.status =
      "SELECTED";

    quotation.isSelected =
      true;

    await quotation.save({
      session,
    });

    /* =====================
       CLOSE RFQ
    ===================== */

    rfq.status =
      "CLOSED";

    rfq.selectedQuotationId =
      quotation._id;

    rfq.selectedSupplierId =
      quotation.supplierId;

    await rfq.save({
      session,
    });

    /* =====================
       COMMIT
    ===================== */

    await session.commitTransaction();

    res.json({
      success: true,

      data:
        quotation,
    });

  } catch (err) {

    await session.abortTransaction();

    console.log(err);

    res.status(400).json({
      success: false,

      error:
        err.message,
    });

  } finally {

    session.endSession();
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
  getVendorRFQ,
  closeRFQ,
  submitQuotation,
  getQuotationById,
  selectQuotation,
  compareQuotations,
};