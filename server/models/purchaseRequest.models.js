const mongoose = require("mongoose");

const prItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    item: String,
    unit: String,
    requestedQty: { type: Number, required: true },
  },
  { timestamps: true }
);

const purchaseRequestSchema = new mongoose.Schema(
  {
    prNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    createdDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: String,
    requirementFor: String,
    reqDate: Date,
    // Site
    site: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
        required: true,
      },
      name: String,
    },

    // store assigned later during approval / issue
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    items: [prItemSchema],
    // Approval flow
    storeApprove: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminApprove: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    accountsApprove: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    inchargeApprove: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    deliveryStatus: {
      type: String,
      enum: ["Pending", "Partially Delivered", "Delivered"],
      default: "Pending",
    },
    deliveryNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Delivery_Note",
      },
    ],

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid"],
      default: "Pending",
    },
    salesInvoiceId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesInvoice",
      },
    ],
  },
  { timestamps: true }
);

const PurchaseRequest = mongoose.model(
  "PurchaseRequest",
  purchaseRequestSchema
);
module.exports = PurchaseRequest;
