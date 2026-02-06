const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },
  description: String,

  orderedQty: Number,
  receivedQty: {
    type: Number,
    required: true,
  },
  acceptedQty: {
    type: Number,
    required: true,
  },
  rejectedQty: {
    type: Number,
    required: true,
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

const grnSchema = new mongoose.Schema(
  {
    grnNo: {
      type: String,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },

    items: [grnItemSchema],

    grossAmount: Number,
    gstAmount: Number,
    netAmount: Number,

    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
      purchaseInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseInvoice",
  },
  cancelledBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
cancelledAt: Date,

  },
  { timestamps: true }
);

const GRN = mongoose.model("GRN", grnSchema);

module.exports = GRN;
