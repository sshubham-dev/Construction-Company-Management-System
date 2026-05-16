const mongoose = require("mongoose");

const deliveryItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  unit: {
    type: String,
    required: true,
  },

  requestedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  issuedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  acceptedQty: {
    type: Number,
    default: 0,
    min: 0,
  },

  rejectedQty: {
    type: Number,
    default: 0,
    min: 0,
  },

  rejectionReason: String,
});

deliveryItemSchema.pre("validate", function () {
  if (
    Number(this.acceptedQty || 0) +
    Number(this.rejectedQty || 0) >
    Number(this.issuedQty || 0)
  ) {
    return
    new Error(
      "Accepted + rejected cannot exceed issued qty"
    )
  }

});

const deliveryNoteSchema = new mongoose.Schema(
  {
    dnNo: {
      type: String,
      unique: true,
      index: true,
    },

    /* =========================
       SOURCE
    ========================== */
    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    /* =========================
       DESTINATION
    ========================== */
    toStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // destination: {
    //   id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     refPath: "deliveryTo",
    //   },
    //   deliveryTo: {
    //     type: String,
    //     enum: ["Site", "Client"],
    //     required: true,
    //   },
    // },

    /* =========================
       LINKED PR (optional)
    ========================== */
    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
    },

    /* =========================
       ACTORS
    ========================== */
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* =========================
       ITEMS
    ========================== */
    items: [deliveryItemSchema],

    /* =========================
       DATES
    ========================== */
    issueDate: {
      type: Date,
      default: Date.now,
    },

    receivedDate: Date,

    /* =========================
       STATUS
    ========================== */
    status: {
      type: String,
      enum: [
        "DRAFT",
        "ISSUED",
        "RECEIVED",
        "VERIFIED", // ✅ remove space
        "MISMATCH",
        "CANCELLED",
      ],
      default: "DRAFT",
    },

    /* =========================
       ATTACHMENTS
    ========================== */
    attachments: [
      {
        url: String,
        public_url: String,
      },
    ],

    narration: String,
  },
  { timestamps: true },
);

deliveryNoteSchema.index({ fromStoreId: 1, toStoreId: 1 });
/* =========================
   VIRTUAL DELIVERY STATUS
========================= */
deliveryNoteSchema.virtual("deliveryStatus").get(function () {
  const totalIssued = this.items.reduce(
    (a, i) => a + Number(i.issuedQty || 0),
    0
  );

  const totalAccepted = this.items.reduce(
    (a, i) => a + Number(i.acceptedQty || 0),
    0
  );

  if (totalAccepted === 0) {
    return "PENDING";
  }

  if (totalAccepted < totalIssued) {
    return "PARTIAL";
  }

  return "COMPLETE";
});



const siteReceiptItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  poItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  orderedQty: {
    type: Number,
    required: true,
  },

  receivedQty: {
    type: Number,
    required: true,
  },

  rejectedQty: {
    type: Number,
    default: 0,
  },

  rate: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  remarks: String,
});

const siteReceiptSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    /* ======================
     PO LINK
  ====================== */

    poId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PO",
      required: true,
      index: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    /* ======================
     SITE
  ====================== */

    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store", // type = SITE
      required: true,
    },

    /* ======================
     ITEMS
  ====================== */

    items: [siteReceiptItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    /* ======================
     STATUS
  ====================== */

    status: {
      type: String,
      enum: ["DRAFT", "RECEIVED", "VERIFIED", "POSTED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },

    /* ======================
     META
  ====================== */

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    narration: String,
  },
  { timestamps: true },
);

const DeliveryNote =
  mongoose.models.DeliveryNote ||
  mongoose.model("DeliveryNote", deliveryNoteSchema);
const SiteReceipt = mongoose.model("SiteReceipt", siteReceiptSchema);

module.exports = { DeliveryNote, SiteReceipt };
