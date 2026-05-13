const mongoose = require("mongoose");

/* =========================
   PO ITEM
========================= */
const poItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

  unit: { type: String, required: true },

  quantity: { type: Number, required: true },

  rate: { type: Number, required: true },

  amount: { type: Number, required: true },

  receivedQty: { type: Number, default: 0 },

  remarks: String,
});

/* =========================
   MAIN PO
========================= */
const purchaseOrderSchema = new mongoose.Schema(
  {
    poNo: { type: String, unique: true, index: true },

    date: { type: Date, default: Date.now },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    deliveryType: {
      type: String,
      enum: ["STORE", "SITE"],
      required: true,
    },

    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },

    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: "RFQ" },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },
    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
    },

    items: [poItemSchema],

    totalAmount: { type: Number, required: true },

    paymentTerms: { type: String, default: "As per agreement" },

    status: {
      type: String,
      enum: ["DRAFT", "ORDERED", "PARTIAL", "COMPLETED", "CANCELLED"],
      default: "DRAFT",
    },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    narration: String,
  },
  { timestamps: true }
);

/* =========================
   AUTO STATUS
========================= */
purchaseOrderSchema.methods.updateStatus = function () {
  const total = this.items.reduce((a, i) => a + i.quantity, 0);
  const received = this.items.reduce((a, i) => a + i.receivedQty, 0);

  if (received === 0) this.status = "ORDERED";
  else if (received < total) this.status = "PARTIAL";
  else this.status = "COMPLETED";
};

module.exports =
  mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", purchaseOrderSchema);