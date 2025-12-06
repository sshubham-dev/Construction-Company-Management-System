const mongoose = require("mongoose");

const siItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    item: String, // for quick UI display
    unit: String,

    quantity: Number, // delivered quantity from DN
    rate: Number, // sale rate from StockItem
    gstRate: Number,
    amount: Number, // qty * rate
  },
  { timestamps: true }
);

const salesInvoiceSchema = new mongoose.Schema(
  {
    // ---------------------------------------
    // Basic Invoice Info
    // ---------------------------------------
    invoiceNumber: {
      type: String,
      unique: true,
      trim: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    businessUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ---------------------------------------
    // Link to Delivery Note (Mandatory)
    // ---------------------------------------
    deliveryNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery_Note",
      required: true,
    },

    // ---------------------------------------
    // Who is being billed? (Always Site)
    // ---------------------------------------
    billedTo: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Site",
        required: true,
      },
      name: String,
      address: String,
    },

    // ---------------------------------------
    // Items Delivered (from DN)
    // ---------------------------------------
    items: [siItemSchema],

    // ---------------------------------------
    // Financial Summary
    // ---------------------------------------
    totalBeforeTax: Number,
    totalTax: Number,
    totalAfterTax: Number,

    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid"],
      default: "Pending",
    },

    // ---------------------------------------
    // Ledger (Payment Received Into)
    // ---------------------------------------
    paymentLedger: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
      },
      name: String,
    },

    ledgerEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
    remarks: String,
  },
  { timestamps: true }
);

const SalesInvoice = mongoose.model("SalesInvoice", salesInvoiceSchema);
module.exports = SalesInvoice;
