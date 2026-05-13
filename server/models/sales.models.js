const mongoose = require("mongoose");

const salesVoucherSchema = new mongoose.Schema(
  {
    voucherNo: {
      type: String,
      required: true,
      unique: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    customerLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    /* ======================
     ITEMS (MIXED)
  ====================== */

    items: [
      {
        // type: {
        //   type: String,
        //   enum: ["MATERIAL", "SERVICE"],
        //   required: true,
        // },

        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },

        description: String,

        quantity: Number,
        rate: Number,
        amount: Number,

        gstRate: Number,
        taxAmount: Number,
      },
    ],

    subTotal: Number,
    totalTax: Number,
    netAmount: Number,

    /* ======================
         ACCOUNTING
      ====================== */

    salesLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    /* ======================
     STATUS
  ====================== */

    status: {
      type: String,
      enum: ["DRAFT", "POSTED", "CANCELLED"],
      default: "DRAFT",
    },

    narration: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

salesSchema.pre("save", function () {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.taxAmount = this.items.reduce((sum, item) => sum + item.tax, 0);
  this.grandTotal = this.totalAmount + this.taxAmount;
});

const Sales = mongoose.model("Sales", salesSchema);
module.exports = Sales;
