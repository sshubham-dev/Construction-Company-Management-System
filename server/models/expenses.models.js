const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    /* ======================
       IDENTITY
    ====================== */
    expenseNo: {
      type: String,
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    costcenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
      default: null,
    },

    /* ======================
       CORE LEDGERS
    ====================== */

    // WHAT kind of expense (Diesel, Cement, Travel, etc.)
    expenseLedger: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
      name: String,
    },

    // WHO paid (Employee / Cash / Bank / Advance)
    paidByLedger: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
      name: String,
    },

    // WHERE expense belongs (Site / Store / Office / Department)
    expenseForLedger: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
        required: true,
      },
      name: String,
    },

    /* ======================
       AMOUNT
    ====================== */
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    narration: {
      type: String,
      required: true,
    },

    /* ======================
       ATTACHMENTS
    ====================== */
    attachments: [
      {
        url: String,
        public_id: String,
        fileType: String, // image / pdf
      },
    ],

    /* ======================
       WORKFLOW
    ====================== */
    status: {
      type: String,
      enum: ["Draft", "Posted", "Cancelled"],
      default: "Draft",
    },

    /* ======================
   LINKING
====================== */
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
    },

    /* ======================
       SYSTEM
    ====================== */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isApproved: {
      type: String,
      enum: ["For Approval", "Approved", "Rejected"],
      default: "For Approval",
    },

    remarks: String,
  },
  { timestamps: true },
);

const Expenses = mongoose.model("Expense", expenseSchema);
module.exports = Expenses;
