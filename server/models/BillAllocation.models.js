const mongoose = require("mongoose");

const billAllocationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    partyLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
      index: true,
    },

    billType: {
      type: String,
      enum: [
        "INVOICE",
        "CONTRACTOR_BILL",
        "EXTRA_WORK",
      ],
      required: true,
    },

    billId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    allocationType: {
      type: String,
      enum: [
        "PAYMENT",
        "RECEIPT",
        "PURCHASE_RETURN",
        "SALES_RETURN",
        "JOURNAL",
      ],
      required: true,
    },

    allocationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    allocatedDate: {
      type: Date,
      default: Date.now,
    },

    remarks: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

billAllocationSchema.index({
  companyId: 1,
  billType: 1,
  billId: 1,
});

billAllocationSchema.index({
  allocationType: 1,
  allocationId: 1,
});

module.exports = mongoose.model("BillAllocation", billAllocationSchema);