const mongoose = require("mongoose");

const poItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    item: String, // snapshot name
    unit: String,

    requestedQty: {
      type: Number,
      required: true,
    },

    receivedQty: {
      type: Number,
      default: 0, // updated ONLY by GRN
    },

    invoicedQty: {
      type: Number,
      default: 0, // updated ONLY by Purchase Invoice
    },

    rate: {
      type: Number,
      required: true,
    },

    gstRate: Number,

    amount: Number, // requestedQty * rate (snapshot)

    description: String,
  },
  { timestamps: true },
);

const deliveryRecordSchema = new mongoose.Schema(
  {
    grnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GRN",
    },

    deliveryDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Partial", "Full"],
    },

    remarks: String,
  },
  { timestamps: true },
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC DETAILS
    ========================== */
    poNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },

    poDate: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* =========================
       LINKED REQUEST
    ========================== */
    purchaseRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase_Request",
    },

    /* =========================
       SUPPLIER
    ========================== */
    supplier: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
      },
      name: String,
      phone: String,
    },

    /* =========================
       DELIVERY DESTINATION
    ========================== */
    deliveryTo: {
      type: String,
      enum: ["Store", "Site"],
      required: true,
    },

    deliveryFor: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "deliveryTo",
      },
      name: String,
      contactPerson: String,
      phone: String,
    },

    /* =========================
       ITEMS
    ========================== */
    items: [poItemSchema],

    /* =========================
       APPROVAL FLOW (FIXED)
    ========================== */
    commercialApprovalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    supplierApproval: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },

    accountHeadApproval: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    finalApprovalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    /* =========================
       FINANCIAL SUMMARY
    ========================== */
    totalBeforeTax: Number,
    totalTaxAmount: Number,
    totalAfterTax: Number,

    totalPaid: {
      type: Number,
      default: 0,
    },

    totalDue: {
      type: Number,
      default: 0,
    },

    /* =========================
       DELIVERY / GRN LINK
    ========================== */
    deliveryRecords: [deliveryRecordSchema],

    deliveryStatus: {
      type: String,
      enum: ["Pending", "Partially Delivered", "Delivered"],
      default: "Pending",
    },

    /* =========================
       BILLING
    ========================== */
    purchaseInvoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseInvoice",
      },
    ],

    paymentLedger: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ledger",
      },
      name: String,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partially Paid", "Paid"],
      default: "Pending",
    },

    /* =========================
       RETURNS
    ========================== */
    purchaseReturns: [
      {
        purchaseReturnId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Purchase_Return",
        },
      },
    ],

    remarks: String,
  },
  { timestamps: true },
);

purchaseOrderSchema.index({ "supplier.id": 1 });
purchaseOrderSchema.index({ deliveryStatus: 1 });

purchaseOrderSchema.virtual("isFullyReceived").get(function () {
  return this.items.every((i) => i.receivedQty >= i.requestedQty);
});

purchaseOrderSchema.virtual("isFullyInvoiced").get(function () {
  return this.items.every((i) => i.invoicedQty >= i.receivedQty);
});

purchaseOrderSchema.pre("save", function (next) {
  let totalBeforeTax = 0;
  let totalTaxAmount = 0;

  this.items.forEach((item) => {
    const amount = (item.requestedQty || 0) * (item.rate || 0);
    item.amount = amount;

    totalBeforeTax += amount;

    const gst = item.gstRate ? (amount * item.gstRate) / 100 : 0;

    totalTaxAmount += gst;
  });

  this.totalBeforeTax = totalBeforeTax;
  this.totalTaxAmount = totalTaxAmount;
  this.totalAfterTax = totalBeforeTax + totalTaxAmount;

  this.totalDue = Math.max(
    0,
    (this.totalAfterTax || 0) - (this.totalPaid || 0),
  );

  next();
});

// const purchaseInvoiceItemSchema = new mongoose.Schema({
//   stockId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Stock",
//     required: true,
//   },

//   description: String,

//   grnQty: Number,            // acceptedQty from GRN
//   invoicedQty: {
//     type: Number,
//     required: true,
//   },

//   rate: {
//     type: Number,
//     required: true,
//   },

//   gstRate: Number,

//   amount: Number,           // invoicedQty * rate
// });

// const purchaseInvoiceSchema = new mongoose.Schema(
//   {
//     invoiceNo: {
//       type: String,
//       unique: true,
//       index: true,
//     },

//     invoiceDate: {
//       type: Date,
//       required: true,
//     },

//     supplierId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Supplier",
//       required: true,
//     },

//     storeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Store",
//       required: true,
//     },

//     purchaseOrderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PurchaseOrder",
//     },

//     grnId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "GRN",
//       required: true,
//     },

//     items: [purchaseInvoiceItemSchema],

//     grossAmount: Number,
//     gstAmount: Number,
//     netAmount: Number,

//     status: {
//       type: String,
//       enum: ["Draft", "Posted", "Cancelled"],
//       default: "Draft",
//     },

//     ledgerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Ledger", // Supplier ledger
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = { PurchaseOrder };
