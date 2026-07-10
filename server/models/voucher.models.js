const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    /* ======================
       BASIC INFO
    ====================== */

    voucherNo: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["PAYMENT", "RECEIPT", "CONTRA", "JOURNAL"],
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    fy: {
      type: String,
      required: true,
    },

    narration: String,

    /* ======================
       CORE ACCOUNTING
    ====================== */

    entries: [
      {
        ledgerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ledger",
          required: true,
        },

        type: {
          type: String,
          enum: ["DEBIT", "CREDIT"],
          required: true,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    paidBy: {
      type: String,
      enum: [
        "COMPANY",
        "CLIENT",
      ],
      default: "COMPANY",
    },

    totalDebit: { type: Number, default: 0 },
    totalCredit: { type: Number, default: 0 },

    /* ======================
       BASIC CONTEXT
    ====================== */

    costCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
      default: null,
    },

    /* ======================
       REFERENCE LINKING
    ====================== */

    reference: String,
    referenceId: {
      type: mongoose.Schema.Types.ObjectId, refPath: "reference",
    },

    /* ======================
       STATUS
    ====================== */

    status: {
      type: String,
      enum: ["DRAFT", "POSTED", "CANCELLED"],
      default: "DRAFT",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    postedAt: Date,
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    cancelledAt: Date,
  },
  { timestamps: true },
);


// voucherSchema.index({ voucherNo: 1, companyId: 1 }, { unique: true });

voucherSchema.pre("save", function () {
  let debit = 0;
  let credit = 0;

  for (let entry of this.entries) {
    if (entry.type === "DEBIT") debit += entry.amount;
    else credit += entry.amount;
  }

  if (debit !== credit) {
    throw new Error("Voucher is not balanced");
  }

  this.totalDebit = debit;
  this.totalCredit = credit;
});

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
