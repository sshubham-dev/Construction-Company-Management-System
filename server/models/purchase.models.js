const mongoose = require("mongoose");

/* ==========================================
   PURCHASE ITEM
========================================== */

const itemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["INVENTORY", "SERVICE", "ASSET", "MATERIAL"],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    ledgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      default: null,
    },
    itemName: String,
    description: String,
    hsnSac: String,
    quantity: {
      type: Number,
      default: 1,
    },
    unit: String,
    rate: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxableAmount: {
      type: Number,
      default: 0,
    },
    gstRate: Number,
    cgstRate: Number,
    sgstRate: Number,
    igstRate: Number,
    cessRate: {
      type: Number,
      default: 0,
    },
    cgstAmount: Number,
    sgstAmount: Number,
    igstAmount: Number,
    cessAmount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/* ==========================================
   ADDITIONAL CHARGES
========================================== */

const chargeSchema = new mongoose.Schema(
  {
    ledgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    name: String,

    taxableAmount: {
      type: Number,
      default: 0,
    },

    gstRate: {
      type: Number,
      default: 0,
    },

    cgstRate: {
      type: Number,
      default: 0,
    },

    sgstRate: {
      type: Number,
      default: 0,
    },

    igstRate: {
      type: Number,
      default: 0,
    },

    cessRate: {
      type: Number,
      default: 0,
    },

    cgstAmount: {
      type: Number,
      default: 0,
    },

    sgstAmount: {
      type: Number,
      default: 0,
    },

    igstAmount: {
      type: Number,
      default: 0,
    },

    cessAmount: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      required: true,
    },

    affectsInventoryCost: {
      type: Boolean,
      default: true
    },
  },
  { _id: false }
);

/* ==========================================
   PURCHASE
========================================== */

const purchaseSchema = new mongoose.Schema({
    purchaseNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null
    },

    fy: {
      type: String,
      required: true,
    },

    taxType: {
      type: String,
      enum: ["INTRA", "INTER"],
      default: "INTRA",
      required: true,
    },

    dueDate: Date,

    partyLedgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },

    invoiceNo: String,

    invoiceDate: Date,

    source: {
      type: String,
      enum: ["MANUAL", "GRN"],
      default: "MANUAL",
    },

    costCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
      default: null,
    },

    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      default: null,
    },

    grnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GRN",
      default: null,
    },

    priceType: {
      type: String,
      enum: ["EXCLUSIVE", "INCLUSIVE"],
      default: "EXCLUSIVE",
      required: true,
    },

    items: [itemSchema],

    charges: [chargeSchema],

    summary: {

      subTotal: {
        type: Number,
        default: 0,
      },

      discount: {
        type: Number,
        default: 0,
      },

      gstSummary: [{
        gstRate: {
          type: Number,
          default: 0,
        },
        taxableAmount: {
          type: Number,
          default: 0,
        },

        cgst: {
          type: Number,
          default: 0,
        },
        cgstLedgerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ledger",
          required: true,
        },

        sgst: {
          type: Number,
          default: 0,
        },
        sgstLedgerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ledger",
          required: true,
        },

        igst: {
          type: Number,
          default: 0,
        },
        igstLedgerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ledger",
          required: true,
        },

        cess: {
          type: Number,
          default: 0,
        },
        cessLedgerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ledger",
          required: true,
        },
      }],

      chargeTotal: {
        type: Number,
        default: 0,
      },

      roundOff: {
        type: Number,
        default: 0,
      },

      grandTotal: {
        type: Number,
        required: true,
      }
    },


    /* Accounting */
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    outstandingAmount: {
      type: Number,
      default: 0,
    },


    status: {
      type: String,
      enum: [
        "DRAFT",
        "POSTED",
        "PARTIALLY_PAID",
        "PAID",
        "CANCELLED"
      ],
      default: "DRAFT"
    },

    narration: String,

    paymentTerms: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    postedAt: Date,

    cancelledAt: Date,
  }, {
  timestamps: true,
}
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;