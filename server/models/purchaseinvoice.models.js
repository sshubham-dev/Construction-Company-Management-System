const mongoose = require("mongoose");

const purchaseInvoiceItemSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
  item: String,
  unit: String,
  receivedQty: Number,
  rate: Number,
  amount: Number,
  gstRate: Number,
  gstAmount: Number,
  totalAmount: Number,
});

const purchaseInvoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true, index: true },

  invoiceDate: { type: Date, default: Date.now },

  grnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GRN",
    required: true,
    unique: true, // 1 GRN → 1 Invoice
  },

  purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseOrder",
  },

  supplier: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    name: String,
  },

  supplierLedgerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ledger",
    required: true,
  },

  store: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    name: String,
  },

  items: [purchaseInvoiceItemSchema],

  grossAmount: Number,
  gstAmount: Number,
  netAmount: Number,

  paymentStatus: {
    type: String,
    enum: ["Pending", "Partially Paid", "Paid"],
    default: "Pending",
  },

  totalPaid: { type: Number, default: 0 },
  totalDue: { type: Number, required: true },

  status: {
    type: String,
    enum: ["Draft", "Posted", "Cancelled"],
    default: "Draft",
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });


const PurchaseInvoice = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
module.exports = PurchaseInvoice;