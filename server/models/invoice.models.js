const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true }, // Format: INV/2024-25/001
    date: { type: Date, default: Date.now },
    dueDate: Date,
    business: {
      name: String,
      gstin: String,
      address: String,
      state: String,
      email: String,
      logo: String,
    },
    client: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
      name: String,
      gstin: String,
      email: String,
      address: String,
      shipping: String,
      state: String,
    },
    items: [
      {
        desc: String,
        code: String,
        unit: String,
        qty: Number,
        rate: Number,
        gstRate: Number, // 0, 5, 12, 18, 28
      },
    ],
    taxType: { type: String, enum: ["GST", "IGST"], required: true },
    subTotal: Number,
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalAmount: Number,
    amountInWords: String,
    status: {
      type: String,
      enum: ["Paid", "Unpaid", "Partial"],
      default: "Unpaid",
    },
    notes: String,
    terms: String,
  },
  { timestamps: true },
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
