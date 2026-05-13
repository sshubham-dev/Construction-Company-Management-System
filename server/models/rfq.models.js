const mongoose = require("mongoose");

/* =========================
   RFQ ITEM
========================= */
const rfqItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  lastPurchaseRate: Number,
  remarks: String,
});

/* =========================
   RFQ SUPPLIER
========================= */
const rfqSupplierSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger", required: true },
  accessToken: { type: String, required: true, index: true },
  expiresAt: Date,
});

/* =========================
   RFQ
========================= */
const rfqSchema = new mongoose.Schema(
  {
    rfqNo: { type: String, unique: true, index: true },

    date: { type: Date, default: Date.now },

    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },

    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
    },

    items: [rfqItemSchema],
    suppliers: [rfqSupplierSchema],

    paymentTerms: { type: String, default: "As per agreement" },

    status: {
      type: String,
      enum: ["DRAFT", "SENT", "CLOSED", "CANCELLED"],
      default: "DRAFT",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    narration: String,
  },
  { timestamps: true }
);


/* =========================
   QUOTATION ITEM
========================= */
const quotationItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  lastPurchaseRate: Number,
  variance: Number,
  remarks: String,
});

/* =========================
   QUOTATION
========================= */
const quotationSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: "RFQ", required: true },

    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger", required: true },

    accessToken: { type: String, required: true, index: true },

    items: [quotationItemSchema],

    totalAmount: Number,

    isSelected: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["SUBMITTED", "SELECTED", "REJECTED"],
      default: "SUBMITTED",
    },

    remarks: String,
  },
  { timestamps: true }
);

quotationSchema.index({ rfqId: 1, supplierId: 1 }, { unique: true });

quotationSchema.pre("save", function () {
  this.totalAmount = this.items.reduce(
    (sum, i) => sum + i.quantity * i.rate,
    0
  );
});

const RFQ = mongoose.model("RFQ", rfqSchema);
const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = { RFQ, Quotation };