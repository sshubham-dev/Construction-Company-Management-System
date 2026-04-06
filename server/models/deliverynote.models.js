const mongoose = require("mongoose");

const deliveryItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    // prItemId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    // },

    unit: String,

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

    /* 🔥 PRICING SNAPSHOT */
    costRate: {
      type: Number,
      required: true,
    }, // from store inventory
    sellingRate: Number, // after margin
    gstRate: Number,

    amount: Number,
    taxAmount: Number,
  },
  { _id: false },
);

deliveryItemSchema.pre("save", function () {
  if (this.acceptedQty + this.rejectedQty !== this.issuedQty) {
    return new Error("Accepted + Rejected must equal Issued");
  }

  if (this.acceptedQty > this.issuedQty) {
    return new Error("Accepted cannot exceed issued");
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

    destination: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "deliveryTo",
      },
      deliveryTo: {
        type: String,
        enum: ["Site", "Client"],
        required: true,
      },
    },

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
      enum: ["Draft", "Issued", "Verified", "Mismatch", "Cancelled"],
      default: "Draft",
    },

    /* =========================
       ATTACHMENTS
    ========================== */
    attachments: [
      {
        url: String,
        fileType: String,
      },
    ],

    remarks: String,
  },
  { timestamps: true },
);

deliveryNoteSchema.pre("save", function () {
  let total = 0;
  let gst = 0;

  const round = (n) => Math.round(n * 100) / 100;

  this.items.forEach((item) => {
    const amount = round((item.acceptedQty || 0) * (item.sellingRate || 0));
    item.amount = amount;

    total += amount;

    const tax = item.gstRate ? round((amount * item.gstRate) / 100) : 0;

    item.taxAmount = tax;
    gst += tax;
  });

  this.totalAmount = round(total);
  this.totalTax = round(gst);
  this.netAmount = round(total + gst);
});

deliveryNoteSchema.virtual("statusAuto").get(function () {
  const totalIssued = this.items.reduce((a, i) => a + i.issuedQty, 0);
  const totalAccepted = this.items.reduce((a, i) => a + i.acceptedQty, 0);

  if (totalAccepted === 0) return "Issued";
  if (totalAccepted < totalIssued) return "Mismatch";
  return "Verified";
});

const DeliveryNote =
  mongoose.models.DeliveryNote ||
  mongoose.model("DeliveryNote", deliveryNoteSchema);

module.exports = DeliveryNote;
