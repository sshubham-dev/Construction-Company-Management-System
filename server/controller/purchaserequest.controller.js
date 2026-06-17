const PurchaseRequest = require("../models/purchaserequest.models");
const { RFQ } = require("../models/rfq.models");
const Site = require("../models/site.models");
const { Store } = require("../models/store.models");
const { Item } = require("../models/stock.models");
const { DeliveryNote, SiteReceipt } = require("../models/deliverynote.models");

/* =====================================
   GENERATE PR NUMBER
===================================== */
async function generatePrNumber() {
  const last = await PurchaseRequest.findOne()
    .sort({ createdAt: -1 })
    .select("prNumber");

  const year = new Date().getFullYear();

  if (!last) return `PR-${year}-0001`;

  const lastNumber = parseInt(last.prNumber.split("-")[2]) || 0;

  return `PR-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
}

function updatePRStatus(pr) {
  const totalRequested = pr.items.reduce((a, i) => a + i.requestedQty, 0);
  const totalIssued = pr.items.reduce((a, i) => a + i.issuedQty, 0);

  if (totalIssued === 0) pr.status = "APPROVED";
  else if (totalIssued < totalRequested) pr.status = "PARTIAL";
  else pr.status = "DELIVERED";
}

/* =====================================
   CREATE PR (DRAFT)
===================================== */
const createPurchaseRequest = async (req, res) => {
  try {
    const user = req.user;

    const { site, store, reqDate, requirementFor, group, category, narration, items } =
      req.body;

    if (!site) throw new Error("Site required");
    if (!store) throw new Error("Store required");
    if (!items?.length) throw new Error("Items required");

    const [existingSite, existingStore] = await Promise.all([
      Store.findById(site),
      Store.findById(store),
    ]);

    if (existingSite.type !== "SITE") {
      throw new Error("Invalid site (must be SITE)");
    }

    if (existingStore.type !== "WAREHOUSE") {
      throw new Error("Invalid store (must be WAREHOUSE)");
    }

    const itemIds = items.map(i => i.itemId);
    const dbItems = await Item.find({ _id: { $in: itemIds } });

    const itemMap = new Map(dbItems.map(i => [i._id.toString(), i]));

    const processedItems = items.map(i => {
      const item = itemMap.get(i.itemId);
      if (!item) throw new Error("Invalid item");

      return {
        itemId: item._id,
        unit: item.unit,
        requestedQty: Number(i.requestedQty),
        issuedQty: 0,
        pendingQty: Number(i.requestedQty),
      };
    });

    const pr = await PurchaseRequest.create({
      prNumber: await generatePrNumber(),
      site,
      store,
      reqDate,
      requirementFor,
      group,
      category,
      narration,
      items: processedItems,
      status: "DRAFT",
      inchargeApprove: "PENDING",
      createdBy: user._id,
    });

    res.status(201).json({ success: true, data: pr });
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   UPDATE PR (ONLY DRAFT)
===================================== */
const updatePurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");
    if (pr.status !== "DRAFT") throw new Error("Only draft editable");

    const { items, narration, reqDate, group, category, requirementFor } = req.body;

    if (items) {
      const updatedItems = [];

      for (const i of items) {
        const item = await Item.findById(i.itemId);
        if (!item) throw new Error("Invalid item");

        updatedItems.push({
          itemId: item._id,
          unit: item.unit,
          requestedQty: Number(i.requestedQty),
          issuedQty: 0,
        });
      }

      pr.items = updatedItems;
    }

    if (narration !== undefined) pr.narration = narration;
    if (reqDate) pr.reqDate = reqDate;
    if (category) pr.category = category;
    if (group) pr.group = group;
    if (requirementFor) pr.requirementFor = requirementFor;

    await pr.save();

    res.json({ success: true, data: pr });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   SUBMIT PR
===================================== */
const submitPurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");
    if (pr.status !== "DRAFT") throw new Error("Only draft allowed");

    pr.status = "REQUESTED";

    await pr.save();

    res.json({ success: true, message: "Submitted", data: pr });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   APPROVE PR (INCHARGE)
===================================== */
const approvePurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");
    if (pr.status !== "REQUESTED") throw new Error("Invalid state");

    pr.inchargeApprove = "APPROVED";
    pr.status = "APPROVED";

    await pr.save();

    res.json({ success: true, message: "Approved", data: pr });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   REJECT PR
===================================== */
const rejectPurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");
    if (pr.status !== "REQUESTED") throw new Error("Invalid state");

    pr.inchargeApprove = "REJECTED";
    pr.status = "REJECTED";

    await pr.save();

    res.json({ success: true, message: "Rejected", data: pr });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET OPEN PR (FOR DN)
===================================== */
const getOpenPRForDN = async (req, res) => {
  try {
    const prs = await PurchaseRequest.find({
      status: { $in: ["REQUESTED", "APPROVED", "PARTIAL"] },
    }).populate({
      path: "items.itemId",
      populate: [
        {
          path: "categoryId",
        },
        {
          path: "groupId",
        },
      ],
    })
      .populate("site store")
      .exec();

    /* =========================
 FILTER PR
========================== */
    const finalPRs = [];

    for (const pr of prs) {

      /* =========================
         CHECK EXISTING RFQ
      ========================== */

      const existingRFQ =
        await DeliveryNote.findOne({
          purchaseRequestId:
            pr._id,

          status: {
            $ne: "CANCELLED",
          },
        });

      if (existingRFQ) {
        continue;
      }

      /* =========================
         PROCUREMENT ITEMS
      ========================== */

      const procurementItems =
        pr.items.filter(
          (i) => {

            if (
              i.pendingQty <= 0
            ) {
              return false;
            }

            const type =
              i.itemId
                ?.itemType;

            return [
              "INVENTORY", "ASSET",
            ].includes(
              type
            );
          }
        );

      if (
        !procurementItems.length
      ) {
        continue;
      }

      /* =========================
         UPDATE ITEMS
      ========================== */

      pr.items =
        procurementItems;

      finalPRs.push(pr);
    }

    return res.json(finalPRs);
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: err.message });
  }
};


/* =====================================
   GET OPEN PR (FOR RFQ)
===================================== */
const getOpenPRForRFQ = async (req, res) => {
  try {

    /* =========================
       LOAD PR
    ========================== */

    const prs =
      await PurchaseRequest.find({
        status: {
          $in: [
            "REQUESTED",
            "APPROVED",
            "PARTIAL",
          ],
        },
      })

        .populate({
          path: "items.itemId",

          populate: [
            {
              path: "categoryId",
            },
            {
              path: "groupId",
            },
          ],
        })

        .populate(
          "site store"
        )

        .lean();

    /* =========================
       FILTER PR
    ========================== */

    const finalPRs = [];

    for (const pr of prs) {

      /* =========================
         CHECK EXISTING RFQ
      ========================== */

      const existingRFQ =
        await RFQ.findOne({
          purchaseRequestId:
            pr._id,

          status: {
            $ne: "CANCELLED",
          },
        });

      if (existingRFQ) {
        continue;
      }

      /* =========================
         PROCUREMENT ITEMS
      ========================== */

      const procurementItems =
        pr.items.filter(
          (i) => {

            if (
              i.pendingQty <= 0
            ) {
              return false;
            }

            const type =
              i.itemId
                ?.itemType;

            return [
              "MATERIAL",
              "SERVICE",
            ].includes(
              type
            );
          }
        );

      if (
        !procurementItems.length
      ) {
        continue;
      }

      /* =========================
         UPDATE ITEMS
      ========================== */

      pr.items =
        procurementItems;

      finalPRs.push(pr);
    }

    return res.json({
      success: true,
      data: finalPRs,
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =====================================
   GET ALL
===================================== */
const getAllPurchaseRequests = async (req, res) => {
  try {
    const data = await PurchaseRequest.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "items.itemId",
        populate: [
          {
            path: "categoryId",
          },
          {
            path: "groupId",
          },
        ],
      })
      .populate("site store category group createdBy")
      .exec();

    return res.json(data);
  } catch (error) {
    console.log(error)
  }
};

/* =====================================
   GET BY ID
===================================== */
const getPurchaseRequestById = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id).populate({
      path: "items.itemId",
      populate: [
        {
          path: "categoryId",
        },
        {
          path: "groupId",
        },
      ],
    })
      .populate("site store category group createdBy")
      .exec();

    if (!pr) return res.status(404).json({ message: "Not found" });

    return res.json(pr);
  } catch (error) {
    console.log(error)
  }

};

/* =====================================
   DELETE PR (ONLY DRAFT)
===================================== */
const deletePurchaseRequest = async (req, res) => {
  try {
    const pr = await PurchaseRequest.findById(req.params.id);

    if (!pr) throw new Error("PR not found");
    if (pr.status !== "DRAFT") throw new Error("Only draft can be deleted");

    await pr.deleteOne();

    res.json({ success: true, message: "PR deactivated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* =====================================
   GET BY SITE
===================================== */
const getPurchaseRequestBySite = async (req, res) => {
  try {
    const prs = await PurchaseRequest.find({
      site: req.params.id,
    }).populate({
      path: "items.itemId",
      populate: [
        {
          path: "categoryId",
        },
        {
          path: "groupId",
        },
      ],
    })
      .populate("site store")
      .exec();

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
  getOpenPRForRFQ,
};
