const mongoose = require("mongoose");

const deliveryItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    item: String, // snapshot
    unit: String,

    // From Purchase Request
    requestedQty: {
      type: Number,
      required: true,
      min: 0,
    },

    // From Store (Issue)
    issuedQty: {
      type: Number,
      required: true,
      min: 0,
    },

    // From Site (Confirmation)
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

    status: {
      type: String,
      enum: ["Issued", "Verified", "Mismatch"],
      default: "Issued",
    },
  },
  { _id: false }
);

const deliveryNoteSchema = new mongoose.Schema(
  {
    deliveryNoteNo: {
      type: String,
      unique: true,
      index: true,
    },

    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
    },

    store: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
      },
      name: String,
    },

    site: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
        required: true,
      },
      name: String,
    },

    // Actors
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // store staff
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // site supervisor
    },

    items: [deliveryItemSchema],

    issueDate: {
      type: Date,
      default: Date.now,
    },

    receivedDate: Date,

    status: {
      type: String,
      enum: ["Draft", "Issued", "Verified", "Mismatch", "Cancelled"],
      default: "Draft",
    },

    salesInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
    },

    attachments: [
      {
        url: String,
        fileType: String,
      },
    ],

    remarks: String,
  },
  { timestamps: true }
);

deliveryNoteSchema.pre("save", async function (next) {
  try {
    if (this.deliveryNoteNo) return next();

    const year = new Date(this.date || Date.now()).getFullYear();

    const storeCode =
      this.store?.name?.replace(/\s+/g, "").toUpperCase().slice(0, 8) ||
      "STORE";

    const lastDN = await this.constructor
      .findOne({
        "store.id": this.store.id,
        deliveryNoteNo: { $regex: `^DN/${storeCode}/${year}/` },
      })
      .sort({ createdAt: -1 })
      .lean();

    let nextSeq = 1;

    if (lastDN?.deliveryNoteNo) {
      const parts = lastDN.deliveryNoteNo.split("/");
      const lastSeq = parseInt(parts[3], 10);
      if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    this.deliveryNoteNo = `DN/${storeCode}/${year}/${String(nextSeq).padStart(
      4,
      "0"
    )}`;

    next();
  } catch (err) {
    next(err);
  }
});

const DeliveryNote =
  mongoose.models.DeliveryNote ||
  mongoose.model("DeliveryNote", deliveryNoteSchema);

module.exports = DeliveryNote;
