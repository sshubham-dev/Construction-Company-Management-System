const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true,
  },

  dnItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // link to DN item
  },

  unit: String,

  returnQty: {
    type: Number,
    required: true,
    min: 0,
  },

  rate: Number,

  amount: Number,

  condition: {
    type: String,
    enum: ["New", "Used", "Scrap"],
    required: true,
  },

  remarks: String,
});
returnItemSchema.pre("save", function () {
  if (this.returnQty > this.issuedQty) {
    return new Error("Return qty cannot exceed issued qty");
  }
});

const returnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      unique: true,
      index: true,
    },

    /* =========================
       RETURN TYPE
    ========================== */
    type: {
      type: String,
      enum: ["SITE_RETURN", "PURCHASE_RETURN"],
      required: true,
    },

    /* =========================
       SOURCE
    ========================== */
    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    toStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    /* =========================
       REFERENCES
    ========================== */
    deliveryNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryNote",
    },

    purchaseInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseInvoice",
    },

    /* =========================
       ITEMS
    ========================== */
    items: [returnItemSchema],

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

    remarks: String,
  },
  { timestamps: true },
);

const Return = mongoose.model("Return", returnSchema);
module.exports = Return;
