const mongoose = require("mongoose")

const paymentChallanSchema = new mongoose.Schema({
  challanNo: String,

  challanType: {
    type: String,
    enum: ["SYSTEM", "MANUAL"],
    required: true
  },

  status: {
    type: String,
    enum: [
      "DRAFT",
      "PENDING_APPROVAL",
      "APPROVED",
      "REJECTED",
      "ISSUED",
      "IN_PROGRESS",
      "PARTIAL",
      "COMPLETED"
    ],
    default: "DRAFT"
  },

  createdBy: { type:mongoose.Schema.Types.ObjectId, ref: "User" },

  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: Date,
  rejectionReason: String,

  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  items: [
    {
      isManual: Boolean,

      sourceType: {
        type: String,
        enum: ["BILL", "EXPENSE"],
        default: null
      },
      sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      },

      partyName: String,
      purpose: String,

      approvedAmount: Number,
      paidAmount: { type: Number, default: 0 },

      paymentMode: String,

      receiverName: String,
      signatureUrl: String,
      transactionRef: String,

      status: {
        type: String,
        enum: ["PENDING", "PAID", "PARTIAL"],
        default: "PENDING"
      },

      paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      paidAt: Date
    }
  ]
}, { timestamps: true });

const PaymentChallan = mongoose.model("PaymentChallan", paymentChallanSchema);
module.exports =  PaymentChallan