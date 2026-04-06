const mongoose = require("mongoose");

const grnItemSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },

  poItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // link to PO item
  },

  orderedQty: Number,

  receivedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  acceptedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  rejectedQty: {
    type: Number,
    required: true,
    min: 0,
  },

  rate: {
    type: Number,
    required: true,
  },

  gstRate: {
    type: Number,
    default: 0,
  },

  remarks: String,
});

grnItemSchema.pre("save", function () {
  if (this.acceptedQty + this.rejectedQty !== this.receivedQty) {
    return new Error("Accepted + Rejected must equal Received");
  }

  if (this.acceptedQty > this.receivedQty) {
    return new Error("Accepted cannot exceed received");
  }
});

const grnSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC
    ========================== */
    grnNo: {
      type: String,
      unique: true,
      index: true,
    },

    /* =========================
       DELIVERY DESTINATION
    ========================== */
    deliveryTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    /* =========================
       STORE (OWNER)
    ========================== */
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    /* =========================
       SUPPLIER
    ========================== */
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    /* =========================
       PO LINK
    ========================== */
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },

    /* =========================
       ITEMS
    ========================== */
    items: [grnItemSchema],

    /* =========================
       STATUS
    ========================== */
    status: {
      type: String,
      enum: ["DRAFT", "POSTED", "CANCELLED"],
      default: "DRAFT",
    },

    /* =========================
       AUDIT
    ========================== */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancelledAt: Date,
  },
  { timestamps: true },
);

const GRN = mongoose.model("GRN", grnSchema);

module.exports = GRN;
