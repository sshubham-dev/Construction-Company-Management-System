const mongoose = require("mongoose");

const deliveryItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    item: String,
    requestedQty: Number, // from PR
    approvedQty: Number, // from PR
    deliveredQty: {
      type: Number,
      default: 0,
    },
    unit: String,
    remarks: String,
  },
  { timestamps: true }
);

const deliveryNoteSchema = new mongoose.Schema(
  {
    purchaseRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
    },

    site: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Site" },
      name: String,
    },

    // who generated DN (Mostly Store)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // optional - when supplier directly delivers
    supplier: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
      name: String,
    },

    store: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessUnit" },
      name: String,
    },

    // Items actually delivered
    items: [deliveryItemSchema],

    // Delivery details
    deliveryDate: {
      type: Date,
      default: Date.now,
    },

    receivedBy: {
      name: String,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // site incharge
    },

    status: {
      type: String,
      enum: ["Delivered", "Pending"],
      default: "Delivered",
    },

    // sales invoice linking
    salesInvoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
    },
    attachments: [{ url: String, fileType: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryNote", deliveryNoteSchema);
