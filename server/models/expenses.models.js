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

    /* ======================
       CORE LEDGERS
    ====================== */

    expenseCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null
      // required: true,
    },

    // WHAT kind of expense (Diesel, Cement, Travel, etc.)
    expenseLedger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    // WHO paid (Employee / Cash / Bank / Advance)
    paidByLedger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    // WHERE expense belongs (Site / Store / Office / Department)
    expenseFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
      default: null,
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
      enum: ["For Approval", "Accounts Approved", "Approved", "Accounts Rejected", "Rejected"],
      default: "For Approval",
    },

    remarks: String,
  },
  { timestamps: true },
);

const Expenses = mongoose.model("Expense", expenseSchema);
module.exports = Expenses;
